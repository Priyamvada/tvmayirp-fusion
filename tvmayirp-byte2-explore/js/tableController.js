function updateTable(param) {
      button = document.getElementById(param);
      if (button.className.includes("active")) {
        button.className = "ui basic button";
      } else {
        button.className = "ui basic button active";
      }
      cols = [];
      buttons = document.getElementsByTagName('button');
      for(var i = 0; i < buttons.length; i++) {
        id = buttons[i].id;
        if(id != null) {
          if(buttons[i].className.includes("active")) {
              cols.push(id);
          }
        }
      }
      console.log('Columns requested from table');
      console.log(cols);
      //ajax query
      $.ajax({
        url: '/_update_table',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({'cols' : cols}),
        type: 'POST',
        success: function (res, status) {
          console.log("successrunning");
          // On Success
          var cols = res["headers"];
          var rows = res["content"];
                 // get the table, columns and rows
                 table = document.getElementById("data");
                 headers = document.getElementById("cols");
                 body = document.getElementById("rows");
                 // delete current contents
                 headers.innerHTML='';
                 body.innerHTML = '';
                 for (col in cols) {
                  cell = document.createElement("th");
                  cell.innerHTML = cols[col];
                  headers.appendChild(cell);
                 }
                 for (row in rows) {
                  tr = document.createElement("tr");
                  for (item in rows[row]) {
                    td = document.createElement("td");
                    td.innerHTML = rows[row][item];
                    tr.appendChild(td);
                  }
                  body.appendChild(tr);
                 }
             }
      });
}