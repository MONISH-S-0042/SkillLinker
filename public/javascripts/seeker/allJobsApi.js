window.addEventListener("pagehide", () => {
    sessionStorage.setItem(location.pathname + "_scrollY", window.scrollY);
});

async function restoreScroll() {
    const scrollY = sessionStorage.getItem(location.pathname + "_scrollY");
    if (scrollY) {
        requestAnimationFrame(() => window.scrollTo(0, scrollY));
    }
}



const getList = async (category) => {
    let jobsJson;
    if (category) jobsJson = await fetch(`/api/seeker/getJoblist?category=${category}`);
    else jobsJson = await fetch('/api/seeker/getJoblist');
    let jobRes = await jobsJson.json();
    const jobs = sortJobs(jobRes.jobs);
    let categoryJobs = jobRes.categoryJobs;
    return {
        jobs,
        categoryJobs
    };
}
const sortJobs = (jobs) => {
    const statusOrder = {
        approved: 0,
        null: 1,
        rejected: 2,
        pending: 3
    };

    jobs.sort((a, b) => {
        const aStatus = a.approval_status ?? 'null';
        const bStatus = b.approval_status ?? 'null';
        return statusOrder[aStatus] - statusOrder[bStatus];
    });
    return jobs;
}
const sortRecommended = (jobs) => {
    jobs.sort((a, b) => {
        const gapA = a.req_skills.length - a.matchedSkills;
        const gapB = b.req_skills.length - b.matchedSkills;
        if (gapA !== gapB) return gapA - gapB;
        return b.matchedSkills - a.matchedSkills;
    });
    return jobs;
}
const createJobCard = (job) => {
    const outerDiv = document.createElement('div');
    outerDiv.classList.add('card', 'text-center', 'col-md-3', 'my-3', 'job-card');
    outerDiv.style.flexBasis = '32%';

    // Header
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('card-header');

    const p = document.createElement('p');
    p.classList.add('text-dark', 'm-0');
    p.innerText = job.approval_status ? 'Application Status: ' : 'New Job Available';

    if (job.approval_status) {
        p.classList.add('fw-bold');
        const span = document.createElement('span');
        span.innerText = job.approval_status;

        if (job.approval_status === 'pending') {
            span.classList.add('text-secondary');
        } else {
            span.classList.add(job.approval_status === 'approved' ? 'text-success' : 'text-danger');
        }

        span.classList.add('fw-bold');
        p.appendChild(span);
    }

    headerDiv.appendChild(p);

    // Body
    const bodyDiv = document.createElement('div');
    bodyDiv.classList.add('card-body');

    const h5 = document.createElement('h5');
    h5.classList.add('card-title');
    h5.innerText = job.title;

    const jobDesc = document.createElement('p');
    jobDesc.classList.add('card-text');
    jobDesc.innerText = `${job.description.substring(0, 30)}...`;

    const anchor = document.createElement('a');
    anchor.classList.add('btn', 'btn-primary');
    anchor.innerText = 'See Details';
    anchor.href = `/seeker/${job._id}/jobDesc`;

    bodyDiv.appendChild(h5);
    bodyDiv.appendChild(jobDesc);
    bodyDiv.appendChild(anchor);

    // Footer
    const footer = document.createElement('div');
    footer.classList.add('card-footer', 'text-body-secondary');
    footer.innerText = `Posted ${timeAgo(job.created)}`;

    // Assemble card
    outerDiv.appendChild(headerDiv);
    outerDiv.appendChild(bodyDiv);
    outerDiv.appendChild(footer);

    return outerDiv;
};

const jobContainer = document.querySelector('.all-job-container');
const warning = document.querySelector('.warning-display');
const addJobsToDOM = async (jobs) => {
    // jobContainer.innerHTML = '';
    for (let job of jobs) {
        const card = createJobCard(job);
        jobContainer.appendChild(card);
    }
    restoreScroll();

};
const allJobsGenerate = async () => {
    let { jobs } = await getList();
    jobs = jobs.filter(job => job.approval_status == null);
    if (jobs.length) {
        addJobsToDOM(jobs);
    }
    else {
        warning.style.display = "block";
        warning.innerText = "No Jobs Posted";
    }
}
const showAppliedJobs = async (approvalStatus) => {
    const { jobs } = await getList();
    let filteredJobs;
    if (approvalStatus != 'all') {
        filteredJobs = jobs.filter(job => job.approval_status === approvalStatus);
    } else {
        filteredJobs = jobs.filter(job => job.approval_status !== null);
    }
    if (filteredJobs.length) {
        addJobsToDOM(filteredJobs);
    } else {
        warning.style.display = "block";
        warning.innerText = "No Rejected Applications";
    }
}
const showCategoryJobs = async (category) => {
    let { categoryJobs } = await getList(category);
    categoryJobs = categoryJobs.filter(job => job.approval_status === null);
    if (categoryJobs.length) {
        addJobsToDOM(sortRecommended(categoryJobs));
    }
    else {
        warning.style.display = "block";
        warning.innerText = "No Jobs Available";
    }
}
//job filter
const jobSelecter = document.querySelector('#job-select');
const jobApplied = document.querySelector('#job-applied');
const searchTitle = document.querySelector('#search-category');

jobSelecter.value = localStorage.getItem('filter-value') || 'allJobs';
jobApplied.value = localStorage.getItem('applied-status') || 'all';
const selecterContainer = document.querySelector('.filter-container');
const appliedContainer = document.querySelector('.applied-container');
const categoryContainer = document.querySelector('.category-container');

const handleJobFilter = (value) => {
    appliedContainer.classList.add('display-none');
    categoryContainer.classList.add('display-none');
    if (value === 'recommended') {
        showCategoryJobs();
    }
    else if (value === 'allJobs') {
        allJobsGenerate();
    }
    else if (value === 'applied') {
        appliedContainer.classList.remove('display-none');
        showAppliedJobs(jobApplied.value);
    }
    else {
        categoryContainer.classList.remove('display-none');
    }
}
handleJobFilter(jobSelecter.value);
jobSelecter.addEventListener('change', function () {
    jobContainer.innerHTML = '';
    warning.innerHTML = '';
    warning.style.display = "none";
    const value = this.value;
    localStorage.setItem('filter-value', value);
    handleJobFilter(value);
})
jobApplied.addEventListener('change', function () {
    jobContainer.innerHTML = '';
    warning.innerHTML = '';
    warning.style.display = "none";
    const value = this.value;
    localStorage.setItem('applied-status', value);
    showAppliedJobs(value);
})
searchTitle.addEventListener('change', () => {
    jobContainer.innerHTML = '';
    warning.innerHTML = '';
    warning.style.display = "none";
    const value = searchTitle.value;
    showCategoryJobs(value);
})