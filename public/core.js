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

    // $(".btn-success").click((e)=>{
    //     var idx = e.target.dataset.id;
    //     var title = $('#title').val();
    //     var date = $('#date').val();

    //     $.ajax({
    //         method : 'put',
    //         url : '/edit',
    //         data : {_id : idx,
    //                 title: title,
    //                 date : date}
    //     }).done((result)=>{
    //         loadList();
    //     }).fail(()=>{
    //         alert("통신 실패")
    //     })
    // })
});

