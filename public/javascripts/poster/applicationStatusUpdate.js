const statusBtns=document.querySelectorAll('.status-button');
const updateStatus = async (id) => {
  try {
    const response = await fetch(`/api/poster/${id}/updateApplicationStatus`);
    const res = await response.json();
    console.log(res);
  } catch (error) {
    console.error('Fetch error:', error);
  }
};
for(let btn of statusBtns){
    btn.addEventListener('click',async()=>{
        btn.disabled=true;
        await updateStatus(btn.id);
        const[action,id]=btn.id.split('-');
        if(action==='acc'|| action==='close' || action==='rejectAll'){
            setTimeout(()=>window.location.reload(),300);
        }
    })
}