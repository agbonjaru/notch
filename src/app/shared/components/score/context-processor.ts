/**
 * @author Oguntuberu Nathan O. <nateogns.work@gmail.com>
**/

class ScoreContextProcessor {
    constructor() { }

    process_context_data(context_data) {
        console.log(context_data);
        const { name } = context_data;
        let return_data: any = {
            context_name: name,
            fitnessFactor: {},
            orgFitness: {},
            data: {}
        };

        switch (name) {
            case 'lead':
                const { lead } = context_data;
                return_data.data = { ...lead };
                return_data.fitnessFactor = lead.fitnessFactor || {};
                return_data.orgFitness = lead.orgFitness || {};
                break;
            case 'contact':
                const { contact } = context_data
                return_data.data = { ...contact };
                return_data.fitnessFactor = contact.fitnessFactor || {};
                return_data.orgFitness = contact.orgFitness || {};
                break;
            case 'company':
                const { company } = context_data;
                return_data.data = { ...company };
                return_data.fitnessFactor = company.fitnessFactor || {};
                return_data.orgFitness = company.orgFitness || {};
                break;
            default:
        }

        return return_data;
    }
}

export default ScoreContextProcessor;