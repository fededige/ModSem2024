$(document).ready(function() {
    var url = "http://localhost:7200/repositories/ModSem2024";
    $('#select_query_appassionato').change(function(){
        $("#results_select").empty();
        $("#tableResult thead").empty();
        $("#tableResult tbody").empty();
        var query;
        var value = document.getElementById("select_query_appassionato").value;
        if(value == 1) {
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            select ?annoStagione where {
                ?campionato rdf:type Basketball:Campionato_Americano;
                            Basketball:NomeCampionato "National Basketball Association Championship";
                            Basketball:haStagione ?stagione.
                ?stagione Basketball:AnnoStagione ?annoStagione.
            }`;
        } else if(value == 2) {
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            select ?nome ?anno where {
                ?campionato rdf:type Basketball:Campionato_Americano;
                            Basketball:NomeCampionato "National Basketball Association Championship";
                            Basketball:haStagione ?stagione.
                ?stagione Basketball:stagioneHaSquadra ?squadra.
                ?squadra Basketball:NomeSquadra ?nome;
                         Basketball:AnnoSquadra ?anno.
            }`;
        } else if (value == 3) {
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            select ?partitaLabel ?nomeSquadra ?dataPartita where {
                ?partita rdf:type Basketball:Partita;
                         Basketball:DataPartita ?dataPartita;
                         rdfs:label ?partitaLabel;
                         Basketball:èGiocataDaCasa ?squadra.
                ?squadra Basketball:NomeSquadra ?nomeSquadra.
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
                console.log(result);
                var optDefault = document.createElement('option');
                optDefault.value = 0;
                optDefault.innerHTML = "Seleziona un valore";
                $("#results_select").append(optDefault);
                result.forEach(element => {
                    element = element.replace('\r', '');
                    var opt = document.createElement('option');
                    if(value == 1) {
                        opt.value = element;
                        opt.innerHTML = "Stagione " + element;
                    } else if(value == 2){
                        element = element.replace('\r', '');
                        var values = element.split(',');
                        opt.value = element;
                        opt.innerHTML = values[0] + " nell'anno " + values[1];
                    } else if(value == 3) {
                        element = element.replace('\r', '');
                        var values = element.split(',');
                        opt.value = values[1] + "," + values[2];
                        opt.innerHTML = values[0] + " giocata nel " + values[2].split('T')[0];
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
        var value = document.getElementById("select_query_appassionato").value;
        var query_value = document.getElementById("results_select").value;
        console.log(query_value);
        var query = ``;
        if(value == 1) {
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            select ?nomeSquadra ?anno where {
                ?campionato rdf:type Basketball:Campionato_Americano;
                            Basketball:NomeCampionato "National Basketball Association Championship";
                            Basketball:haStagione ?stagione.
                ?stagione Basketball:AnnoStagione "` + query_value + `";
                          Basketball:haPremio ?premio.
                ?premio Basketball:NomePremio 
                "Larry O’Brien Championship Trophy";
                        Basketball:assegnatoA ?squadra;
                        Basketball:AnnoPremio ?anno.
                ?squadra Basketball:NomeSquadra ?nomeSquadra
            }`;
        } else if(value == 2) {
            var squadra = query_value.split(',')[0];
            var anno = query_value.split(',')[1];
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            select ?partitaLabel ?risultato ?dataPartita where {
                ?campionato rdf:type Basketball:Campionato_Americano;
                            Basketball:NomeCampionato "National Basketball Association Championship";
                            Basketball:haStagione ?stagione.
                ?stagione Basketball:AnnoStagione "` + anno + `";
                          Basketball:haPartita ?partita.
                ?partita Basketball:èGiocataDa ?squadra;
                         Basketball:RisultatoPartita ?risultato;
                         Basketball:DataPartita ?dataPartita;
                         rdfs:label ?partitaLabel.
                ?squadra Basketball:NomeSquadra "` + squadra + `".
            }`;
        } else if(value == 3) {
            var squadraCasa = query_value.split(",")[0];
            var data = query_value.split(",")[1]; 
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            select ?partitaLabel ?nomePalazzetto ?capienza where {
                ?partita Basketball:èGiocataDa ?squadra;
                         Basketball:DataPartita 
                         "` + data + `"^^xsd:dateTime;
                         Basketball:èGiocataIn ?palazzetto;
                         rdfs:label ?partitaLabel.
                ?squadra Basketball:NomeSquadra "` + squadraCasa + `".
                ?palazzetto Basketball:PlaceName ?nomePalazzetto;
                            Basketball:CapienzaPalazzetto ?capienza.
            }`;
            console.log(query);
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
                    console.log(dataRow);
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