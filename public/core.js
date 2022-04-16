$(document).ready(()=>{
    $(".btn-danger").click((e)=>{
        var idx = e.target.dataset.id;
        $.ajax({
        method : 'DELETE',
        url : '/delete',
        data : { _id : idx }
        }).done((result)=>{
        $(e.target).parent('li').fadeOut();
        }).fail(function(){
        alert("실패");
        })
    });


    
});

