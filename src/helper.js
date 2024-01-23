module.exports =
{
    myAsyncFunction,
    myAsyncFunction2
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
