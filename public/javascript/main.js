$( document ).ready(function() {
  function saveRecord(route, record){
      $.ajax({
          url: route,
          method: "POST",
          data: ''
          })
          .then(function(data) {
              console.log(data);
              if (data) {
              console.log("Favorite Movie Saved Sucessfully");
              console.log("data: " + data);
              } else {
              alert("Error Saving Favorite Movie");
              }
        });
  }

  $('.btn-favorite').click(function(){
    let url = window.location.pathname;
    let tokens = url.split("/");
    let movieId = tokens[2];
    let route = `/favorites/${movieId}`;

    console.log("movieId: " + movieId);
    console.log("route: " +  route);

    saveRecord(route);
  });
});
