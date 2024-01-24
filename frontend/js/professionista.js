$(document).ready(function() {
    // url dell'endpoint SPARQL di GraphDB dell'ontologia
    var url = "http://localhost:7200/repositories/ModSem2024";
    $('#select_query_professionista').change(function(){
        $("#results_select").empty();
        $("#tableResult thead").empty();
        $("#tableResult tbody").empty();
        var query;
        var value = document.getElementById("select_query_professionista").value;
        // selezioniamo i dati opportuni per popolare la seconda combobox in base al value della voce selezionata nella prima
        if(value == 1) {
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            select ?nomeCampionato ?anno where {
                ?campionato rdf:type Basketball:Campionato_di_Basket;
                            Basketball:haStagione ?stagione;
                            Basketball:NomeCampionato ?nomeCampionato.
                ?stagione rdf:type Basketball:Stagione;
                          Basketball:AnnoStagione ?anno.
            }`;
        } else if(value == 2) {
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            select ?nome ?anno where {
                ?campionato rdf:type Basketball:Campionato_di_Basket;
                            Basketball:haStagione ?stagione.
                ?stagione Basketball:stagioneHaSquadra ?squadra.
                ?squadra Basketball:NomeSquadra ?nome;
                         Basketball:AnnoSquadra ?anno.
            }`;
        } else if (value == 3) {
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            select ?nomeCampionato ?annoStagione ?nomeSquadra where {
                ?campionato rdf:type Basketball:Campionato_di_Basket;
                            Basketball:haStagione ?stagione;
                            Basketball:NomeCampionato ?nomeCampionato.
                ?stagione Basketball:AnnoStagione ?annoStagione.
                ?stagione Basketball:haPartita ?partita.
                ?partita Basketball:èGiocataDa ?haSquadra.
                ?haSquadra Basketball:NomeSquadra ?nomeSquadra.
            }`;
        }
        // richiesta all'endpoint che utilizza una della tre query costruite in precedenza
        $.ajax({
            url: url,
            type: "get",
            dataType: "text",
            data: {
                query: query
            },
            success: function(data) {
                // elaborazione dei dati ricevuti nella risposta
                var result = data.split('\n');
                result.splice(0, 1);
                result.splice(result.length - 1, 1);

                // costruzione degli elementi che popolano la seconda combobox
                var optDefault = document.createElement('option');
                optDefault.value = 0;
                optDefault.innerHTML = "Seleziona un valore";
                $("#results_select").append(optDefault);
                result.forEach(element => {
                    element = element.replace('\r', '');
                    var opt = document.createElement('option');
                    if(value == 1) {
                        opt.value = element;
                        opt.innerHTML = element.split(",")[0] + " dell'anno " + element.split(",")[1];
                    } else if(value == 2){
                        opt.value = element;
                        opt.innerHTML = element.split(",")[0] + " dell'anno " + element.split(",")[1];
                    } else if(value == 3) {
                        opt.value = element;
                        opt.innerHTML = element.split(",")[0] + " della stagione " + element.split(",")[1] + " - " + element.split(",")[2];
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
        var value = document.getElementById("select_query_professionista").value;
        var query_value = document.getElementById("results_select").value;
        var query;
        // costruzione della query finale parametrizzata in base al valore della voce selezionata
        if(value == 1) {
            var nomeCampionato = query_value.split(",")[0];
            var annoStagione = query_value.split(",")[1];
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            select ?squadra where {
                ?campionato rdf:type Basketball:Campionato_di_Basket;
                            Basketball:NomeCampionato "` + nomeCampionato + `";
                            Basketball:haStagione ?stagione.
                ?stagione Basketball:AnnoStagione "` + annoStagione + `";
                            Basketball:haPartita ?partita.
                ?partita Basketball:èGiocataDa ?haSquadra.
                ?haSquadra Basketball:NomeSquadra ?squadra.
            }`;
        } else if(value == 2) {
            var squadra = query_value.split(',')[0];
            var anno = query_value.split(',')[1];
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            select  ?nomeSquadra  (count(distinct ?persona) as ?numeroPersone) where {
                    ?squadra rdf:type Basketball:Squadra;
                            Basketball:AnnoSquadra "` + anno + `";
                            Basketball:NomeSquadra "` + squadra + `";
                            Basketball:NomeSquadra ?nomeSquadra;
                            Basketball:compostaDa ?persona.
            }
            GROUP BY ?nomeSquadra`;
        } else if(value == 3) {
            var nomeCampionato = query_value.split(",")[0];
            var annoStagione = query_value.split(",")[1]; 
            var nomeSquadra = query_value.split(",")[2]; 
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            select ?nome ?altezza ?peso ?dataNascita
                ?ruolo where {
                ?campionato rdf:type Basketball:Campionato_di_Basket;
                            Basketball:NomeCampionato 
                            "`+ nomeCampionato +`";
                            Basketball:haStagione ?stagione.
                ?stagione Basketball:AnnoStagione "` + annoStagione +`";
                        Basketball:haPartita ?partita.
                ?partita Basketball:èGiocataDa ?squadra.
                ?squadra Basketball:NomeSquadra "` + nomeSquadra + `";
                        Basketball:compostaDa ?persona.
                ?persona rdf:type Basketball:Giocatore;
                        Basketball:NomeCognomePersona ?nome;
                        Basketball:Altezza ?altezza;
                        Basketball:Peso ?peso;
                        Basketball:DataDiNascita ?dataNascita;
                        Basketball:haRuolo ?haRuolo.
                ?haRuolo rdfs:label ?ruolo.
            }`;
        }

        // richiesta all'endpoint SPARQL con la query finale
        $.ajax({
            url: url,
            type: "get",
            dataType: "text",
            data: {
                query: query
            },
            success: function(data) {
                var result = data.split('\n');
                result.splice(result.length - 1, 1);
                
                // costruzione della tabella per mostrare i risultati all'utente
                var table = $("#tableResult");
                var thead = $("<thead>");
                var tbody = $("<tbody>");
                var i = 0;
                result.forEach(element => {
                    var tr = $("<tr>");
                    var dataRow = element.split(',');
                    dataRow.forEach(el => {
                        el = el.replace('\r', '');
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