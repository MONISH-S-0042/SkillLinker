const Agenda = require('agenda');
const { Job } = require('./models/Job');
const agenda = new Agenda({
    db: { 
        address: process.env.DB_URL || 'mongodb://127.0.0.1:27017/skill-linker',
        collection: 'agendaJobs',
        options: {
            tls: true,
            tlsAllowInvalidCertificates: true
        }
    },
    processEvery: '1 minute'
});



(async function () {
    agenda.define('close job', async (job) => {
        const {jobId} = job.attrs.data;
        await Job.findByIdAndUpdate(jobId, { app_status: 'closed' });
        console.log(`Job ${jobId} closed By agenda automatically`);
    })
    await agenda.start();
})();
module.exports = agenda;
