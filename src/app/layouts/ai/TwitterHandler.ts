/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 */

import { TwitterService } from 'src/app/services/integrations/email/twitter.service';
import { EmailService } from 'src/app/services/integrations/email/email.service';

class TwitterHandler {
    /** FORM MESSAGE */
    form_class: string = '';
    form_message: string = '';

    loading: boolean = false;

    socket: any = null;
    tweets_map: any = {};
    tweet_to_reply: any;

    character_count: number = 0;
    limit_exceeded: boolean = false;

    reply_body: string = '';
    selected_template: string = "";

    twitter_setting: any = {};
    twitter_account: any = {};
    listener_pattern: any;

    email_service: EmailService;

    constructor(private twitter_service: TwitterService, email_service: EmailService) {
        //
        this.email_service = email_service;

        //
        this.twitter_service.fetch_user_data().subscribe((response: any) => {
            if (response.success) {
                this.twitter_account = { ...response.payload };
            }
        });

        this.twitter_service.fetch_stream_setting().subscribe((response: any) => {
            if (response.success) {
                this.set_twitter_settings(response.payload);
            }
        })

        /** OBSERVERS */
        this.twitter_service.user_data.subscribe(data => {
            if (Object.keys(data).length) {
                this.twitter_account = { ...data };
            }
        });

        this.twitter_service.listener_settings.subscribe ( data => {
            if (Object.keys(data).length) {
                this.set_twitter_settings({ ...data });
            }
        });
    }

    listen_for_tweets(socket) {
        this.socket = socket;
        socket.on('new_tweet', tweet => {
            // console.log(tweet);
            this.add_tweet(tweet);
        });

        socket.on('tweet:handled', id => {
            this.mark_tweet_as_handled(id);
        });

        socket.on('email:new', data => {
            this.email_service.new_email.next(data)
        });
    }

    add_tweet(tweet) {
        if (!tweet.text) return;
        
        const processed_text = tweet.text.replace(this.listener_pattern, `<span class='text-primary'><b>$&</b></span>`);
        const parsed_tweet = {
            ...tweet,
            text: processed_text,
            is_handled: false
        }

        let tweets = {
            [parsed_tweet.tweet_id] : { ...parsed_tweet}
        }

        let counter = 0, limit = 98;
        for (let id in this.tweets_map) {
            if (counter > limit) break;

            tweets = {
                ...tweets,
                [id]: { ...this.tweets_map[id] }
            }
            counter++;
        }

        this.tweets_map = { ...tweets };
    }

    convert_tweet_array_to_object (tweets: Array <any>) {
        let transformed_tweets = {};
        tweets.forEach( tweet => {
            transformed_tweets = {
                ...transformed_tweets,
                [tweet.tweet_id] : { ...tweet }
            }
        });

        return transformed_tweets;
    }

    convert_tweet_object_to_array () {
        const transformed_tweets = [];
        for ( let i in this.tweets_map) {
            transformed_tweets.push(this.tweets_map[i]);
        }

        return transformed_tweets;
    }

    build_listener_pattern(handles: Array<string>, hashtags: Array<string>) {
        let regex_params = [];

        if (handles && handles.length) {
            handles.forEach(handle => {
                if (!handle.length) return;
                regex_params.push(`@${handle.trim()}`);
            });
        }

        if (hashtags && hashtags.length) {
            hashtags.forEach(hashtag => {
                if (!hashtag.length) return;
                regex_params.push(`#${hashtag.trim()}`);
            });
        }

        return `(${regex_params.join('|')})`;
    }

    count_characters() {
        this.character_count = this.reply_body.length;
        this.limit_exceeded = this.character_count >= 140;
    }

    mark_tweet_as_handled (id) {
        this.tweets_map = {
            ...this.tweets_map,
            [id] : { ...this.tweets_map[id], is_handled: true }
        }
    }

    set_twitter_settings(data) {
        if (Object.keys(data).length) {
            const { handles, hashtags } = data;
            this.twitter_setting = { ...data };
            this.listener_pattern = new RegExp (this.build_listener_pattern(handles, hashtags), 'gi');
        }
    }

    set_reply_body(text) {
        this.reply_body = text;
    }

    open_reply_dialog(tweet) {
        this.tweet_to_reply = { ...tweet };
    }

    select_template(template) {
        this.selected_template = template.id;
        this.reply_body = template.text;
    }

    send_reply() {
        const status = this.reply_body.trim();
        if (!status) {
            this.display_form_message('Enter a valid text');
            return;
        }

        if (status.length > 140) {
            this.display_form_message('Text too long.');
            return;
        }

        if (!this.twitter_account._id) {
            this.display_form_message('No Account connected');
            return;
        }

        const data_to_send = {
            status,
            userId: this.twitter_account._id,
            orgId: this.tweet_to_reply.orgId,
            in_reply_to: this.tweet_to_reply.tweet_id,
            author: this.tweet_to_reply.author_id
        }

        this.loading = true;
        this.twitter_service.send_reply(data_to_send).subscribe((response: any) => {
            this.loading = false
            if (response.success) {
                this.display_form_message(`Reply sent.`, true);
                const { orgId, tweet_id } = this.tweet_to_reply;
                this.mark_tweet_as_handled(tweet_id);
                this.socket.emit('tweet:handled', { orgId, tweet_id });
                this.tweet_to_reply.is_handled = true;
                this.reply_body = '';
                return;
            }

            this.display_form_message('Reply failed.');
        }, (error: any) => {
            this.loading = false;
            this.display_form_message('Reply failed.');
            console.log(`[TwitterHandler] Tweet Reply Error: ${error.message}`);
        });
    }

    display_form_message(message, is_success = false) {
        this.form_class = is_success ? 'alert alert-success' : 'alert alert-danger';
        this.form_message = message;

        setTimeout(() => {
            this.form_class = '';
            this.form_message = '';
        }, 3000);
    }
}

export default TwitterHandler;