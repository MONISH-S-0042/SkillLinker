const puppeteer=require('puppeteer');
const Congig={
    
}

const getConfig=(url)=>{
    const host=new URL(url).hostname;
    return getConfig[host];
}

module.exports.load=async()=>{
    const browser=await puppeteer.launch({headless:false});
    const page=await browser.newPage();
}