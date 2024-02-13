module.exports =
{
    myAsyncFunction,
    myAsyncFunction2,
    returnJson,
    removeStringSender,
    phoneNumberFormatter
}


// Implementation ----------------------------------

async function myAsyncFunction(){
    try{
        var a = 1;
        if(a < 2){
            return "Success";
        }else{
            throw new Error("Failure yet");
        }
    } catch(error){
        console.log(error);
    }
    return;
}

async function myAsyncFunction2(){
    try{
        var a = 1;
        if(a < 2){
            return "Success";
        }else{
            throw new Error("Failure yet");
        }
    } catch(error){
        console.log(error);
    }
    return;
}

async function returnJson(res, status, message, aa){
    res.status(200).json({
        status: status,
        message: message,
        result:aa
    }); 
}
async function removeStringSender(inputString) { 
    return inputString.replace(/[^0-9]/g, ''); 
}
async function phoneNumberFormatter(number) {
    let formatted = number.replace(/\D/g, "");
    if (formatted.startsWith("0")) {
        formatted = "62" + formatted.substr(1);
    }
    if (!formatted.endsWith("@c.us")) {
        formatted += "@c.us";
    }
    return formatted;
}