const triggers = document.querySelectorAll('.popup-trigger');
triggers.forEach(trigger => {
    const popupWindow = document.querySelector(trigger?.dataset.popupTarget);
    const cancelBtns = document.querySelectorAll('.cancel');
    cancelBtns.forEach(cancelBtn => {
        cancelBtn.addEventListener('click', (e) => {
            popupWindow?.classList.add('hide');
        });
    })
    window.addEventListener('click', (e) => {
        if (e.target.classList?.contains('hidden-container')) {
            popupWindow?.classList.add('hide');
        }
    })
    trigger?.addEventListener('click', (e) => {
        popupWindow?.classList.remove('hide');
    })
})
const hiddenContainers = document.querySelectorAll('.hidden-container');
hiddenContainers.forEach(hiddenContainer => {
    const terms = hiddenContainer.querySelector('.terms');
    const apply = hiddenContainer.querySelector('.apply');
    terms?.addEventListener('change', (e) => {
        if (terms.checked) {
            apply.disabled = false;
        }
        else {
            apply.disabled = true;
        }
    })
})
const closeBtns=document.querySelectorAll('.close-button');
closeBtns.forEach(btn=>{
    const closeCard=document.querySelector(btn.dataset.closeClass);
    btn.addEventListener('click',(e)=>{
        closeCard.classList.add('hide');
        setTimeout(()=>{
            closeCard.classList.add('display-none');
        },400)
    })
})