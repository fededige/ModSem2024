$(document).ready(function() {
    var url = "http://localhost:7200/repositories/ModSem2024";
    $('#select_query_popolari').change(function(){
        $("#results_select").empty();
        $("#tableResult thead").empty();
        $("#tableResult tbody").empty();
        var query;
        var value = document.getElementById("select_query_popolari").value;
        if(value == 1) {
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            select ?nomeSquadraCasa ?nomeSquadraOspite ?dataPartita where {
                ?partita rdf:type Basketball:Partita;
                         Basketball:DataPartita ?dataPartita;
                         Basketball:èGiocataDaCasa ?squadraCasa;
                         Basketball:èGiocataDaOspiti ?squadraOspite.
                ?squadraCasa Basketball:NomeSquadra ?nomeSquadraCasa.
                ?squadraOspite Basketball:NomeSquadra ?nomeSquadraOspite.
            }`;
        } else if(value == 2) {
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            select ?nomeCampionato ?nomePremio ?annoStagione where {
                ?campionato rdf:type Basketball:Campionato_di_Basket;
                            Basketball:haStagione ?stagione;
                            Basketball:NomeCampionato ?nomeCampionato.
                ?stagione Basketball:haPremio ?premio;
                          Basketball:AnnoStagione ?annoStagione.
                ?premio rdf:type Basketball:Premio_Individuale;
                        Basketball:NomePremio ?nomePremio.
            }`;
        }
        $.ajax({
            url: url,
            type: "get",
            dataType: "text",
            data: {
                query: query
            },
            success: function(data) {
                console.log(data);
                var result = data.split('\n');
                result.splice(0, 1);
                result.splice(result.length - 1, 1);
                var optDefault = document.createElement('option');
                optDefault.value = 0;
                optDefault.innerHTML = "Seleziona un valore";
                $("#results_select").append(optDefault);
                result.forEach(element => {
                    element = element.replace('\r', '');
                    var opt = document.createElement('option');
                    if(value == 1) {
                        opt.value = element;
                        opt.innerHTML = element.split(",")[0] + " vs " + element.split(",")[1] + " in data " + element.split(",")[2].split("T")[0];
                    } else if(value == 2){
                        opt.value = element;
                        opt.innerHTML = 'Premio "' + element.split(",")[1] + '" del campionato ' + element.split(",")[0] + " nella stagione " + element.split(",")[2];
                    }
                    $("#results_select").append(opt);
                });
            },
            error: function(error) {
                console.log(error);
            }
        });
    });

    $("#results_select").change(function() {
        $("#tableResult thead").empty();
        $("#tableResult tbody").empty();
        var value = document.getElementById("select_query_popolari").value;
        var query_value = document.getElementById("results_select").value;
        var query = ``;
        if(value == 1) {
            var squadraCasa = query_value.split(",")[0];
            var squadraOspite = query_value.split(",")[1];
            var dataPartita = query_value.split(",")[2];
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            select ?nomesquadraCasa ?nomesquadraOspite ?risultato where {
                ?partita Basketball:èGiocataDaCasa ?squadraCasa;
                         Basketball:èGiocataDaOspiti ?squadraOspite;
                         Basketball:DataPartita "` + dataPartita + `"^^xsd:dateTime;
                         Basketball:RisultatoPartita ?risultato.
                ?squadraCasa Basketball:NomeSquadra "` + squadraCasa + `";
                             Basketball:NomeSquadra ?nomesquadraCasa.
                ?squadraOspite Basketball:NomeSquadra "` + squadraOspite + `";
                               Basketball:NomeSquadra ?nomesquadraOspite.
            }
            `;
        } else if(value == 2) {
            var nomeCampionato = query_value.split(',')[0];
            var nomePremio = query_value.split(',')[1];
            var annoStagione = query_value.split(',')[2];
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            select ?nomePartecipante ?squadra ?ruolo where {
                ?campionato rdf:type Basketball:Campionato_di_Basket;
                            Basketball:NomeCampionato "` + nomeCampionato + `";
                            Basketball:haStagione ?stagione.
                ?stagione Basketball:AnnoStagione "` + annoStagione + `";
                        Basketball:haPremio ?premio.
                ?premio Basketball:NomePremio "` + nomePremio + `";
                        Basketball:assegnatoA ?partecipante.
                ?partecipante Basketball:NomeCognomePersona 
                            ?nomePartecipante;
                            Basketball:appartiene ?haSquadra;
                            Basketball:haRuolo ?haRuolo.
                ?haRuolo rdfs:label ?ruolo. 
                ?haSquadra Basketball:NomeSquadra ?squadra.           
            }`;
        }

        $.ajax({
            url: url,
            type: "get",
            dataType: "text",
            data: {
                query: query
            },
            success: function(data) {
                console.log(data);
                var result = data.split('\n');
                result.splice(result.length - 1, 1);
                
                var table = $("#tableResult");
                var thead = $("<thead>");
                var tbody = $("<tbody>");
                var i = 0;
                result.forEach(element => {
                    var tr = $("<tr>");
                    var dataRow = element.split(',');
                    dataRow.forEach(el => {
                        el = el.replace('\r', '');
                        console.log(el);
                        if(i == 0) {
                            tr.append("<th>" + el + "</th>");
                            thead.append(tr);
                        } else {
                            tr.append("<td>" + el + "</td>");
                            tbody.append(tr);
                        }
                    });
                    i++;
                });
                table.append(thead);
                table.append(tbody);
                $(".container").append(table);
            },
            error: function(error) {
                console.log(error);
            }
        });
    });
})