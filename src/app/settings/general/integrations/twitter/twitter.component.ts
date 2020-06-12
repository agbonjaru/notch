import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { GeneralService } from 'src/app/services/general.service';
import { TwitterService } from 'src/app/services/integrations/email/twitter.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-twitter-integration',
  templateUrl: './twitter.component.html',
  styleUrls: ['./twitter.component.css']
})
export class TwitterIntegrationComponent implements OnInit {
  /** Error Control */
  form_class: string = '';
  form_message: string = ''

  /** Spinners control */
  loading: boolean = false;
  dm_loading: boolean = false;
  dm_connected: boolean = false;

  user_data: any = {};
  stream_data: any = {
    hashtags: [],
    handles: []
  }

  form_hashtags: string = '';
  form_handles: string = '';

  constructor(
    private twitter_service: TwitterService,
    private general_service: GeneralService
  ) {

  }

  ngOnInit() {
    this.get_stream_data();
    this.get_user_data();
  }

  get_user_data() {
    this.twitter_service.fetch_user_data().subscribe((response: any) => {
      this.dm_loading = false;
      if (response.success) {
        this.user_data = { ...response.payload };
        this.twitter_service.user_data.next({ ...this.user_data });
        this.dm_connected = this.user_data.isActive;
      }

      this.obtain_access_to_twitter((!response.success || !this.dm_connected));

    }, err => {
      this.dm_loading = false;
      console.log(`[Twitter Integration] User Data Retrieval Error: ${err.message}`);
    });
  }

  get_stream_data() {
    this.twitter_service.fetch_stream_setting().subscribe((response: any) => {
      if (response.success) {
        this.stream_data = { ...response.payload }
        this.form_handles = response.payload.handles.join();
        this.form_hashtags = response.payload.hashtags.join();
      }
    }, err => {
      console.log(`[Twitter Integration] Stream Data Retrieval Error: ${err.message}`);
    });
  }

  obtain_access_to_twitter(permission: boolean = false) {
    const oauth_query_string = window.location.search.substr(1);
    if (!permission || !oauth_query_string.includes('oauth_token')) return;

    this.dm_loading = true;
    this.twitter_service.connect_To_Twitter({ oauth_query_string }).subscribe((response: any) => {
      this.dm_loading = false
      if (response.success) {
        this.get_user_data();
      }
    }, err => {
      this.dm_loading = false;
    });
  }

  initialize_twitter_connection() {
    this.twitter_service.fetch_Token().subscribe((response: any) => {
      const oauth_token = response.oauth_token;
      window.location.href = `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`;
    }, (err: any) => {
      console.log(`Twitter: ${err.message}`);
    });
  }

  disconnect() {
    console.log(this.user_data);
    this.dm_loading = true;
    this.twitter_service.disconnect_from_twitter(this.user_data._id).subscribe((response: any) => {
      this.dm_loading = false;
      if (response.success) {
        this.user_data = {};
        this.dm_connected = false;
      }
    }, err => {
      this.dm_loading = false;
      console.log(`[Twitter Integration] Disconnection Error: ${err.message}`);
    });
  }

  validate_handles_and_hashtags(handles, hashtags) {
    const pattern = /[ ]/
    for (let i in handles) {
      if (pattern.test(handles[i].trim())) return false;
    }

    for (let i in hashtags) {
      if (pattern.test(hashtags[i].trim())) return false;
    }

    return true;
  }

  save_stream_setting() {
    const handles = this.form_handles.replace(/[#@]/g, '').split(',');
    const hashtags = this.form_hashtags.replace(/[@#]/g, '').split(',');

    if (!handles && !hashtags) {
      this.display_form_message(`Handles and hashtags cannot be empty.`);
      return;
    }

    if (!this.validate_handles_and_hashtags(handles, hashtags)) {
      this.display_form_message(`Invalid character(s) in handle/hashtag.`);
      return;
    }

    const stream_setting = {
      ...this.stream_data,
      handles,
      hashtags
    }

    this.loading = true;
    this.twitter_service.set_stream_setting(stream_setting).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.display_form_message(`Settings saved successfully`, 1);
        this.stream_data = { ...response.payload };
        this.form_handles = this.stream_data.handles.join();
        this.form_hashtags = this.stream_data.hashtags.join();
        this.twitter_service.listener_settings.next({ ...response.payload });
      } else {
        this.display_form_message(`Could not save settings`);
      }
    }, err => {
      this.loading = false;
      this.display_form_message(`Could not save settings`);
      console.log(`[Twitter Integration] Stream Setting Error: ${err.message}`);
    })
  }

  display_form_message(message, code = 0) {
    this.form_message = message;

    if (code <= 0) this.form_class = `alert alert-danger`;
    if (code == 1) this.form_class = `alert alert-success`;

    setTimeout(() => {
      this.form_class = '';
      this.form_message = '';
    }, 3000);
  }
}
