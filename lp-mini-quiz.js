(function(){
    var modal=document.querySelector('[data-lp-quiz-modal]');
    if(!modal)return;
    var dialog=modal.querySelector('[role="dialog"]');
    var opener=document.querySelector('[data-lp-quiz-open]');
    var closeButtons=modal.querySelectorAll('[data-lp-quiz-close]');
    function close(){modal.hidden=true;document.body.classList.remove('lp-quiz-modal-open');if(opener)opener.focus();}
    if(opener)opener.addEventListener('click',function(){modal.hidden=false;document.body.classList.add('lp-quiz-modal-open');dialog.focus();});
    closeButtons.forEach(function(button){button.addEventListener('click',close);});
    document.addEventListener('keydown',function(event){
        if(modal.hidden)return;
        if(event.key==='Escape')close();
        if(event.key==='Tab'){
            var controls=modal.querySelectorAll('a[href],button:not([disabled])');
            var first=controls[0],last=controls[controls.length-1];
            if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
            else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
        }
    });
})();
