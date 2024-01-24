$(document).ready(function() {
    // url dell'endpoint SPARQL di GraphDB dell'ontologia
    var url = "http://localhost:7200/repositories/ModSem2024";
    $('#select_query_esterne').change(function(){
        $("#results_select").empty();
        $("#tableResult thead").empty();
        $("#tableResult tbody").empty();
        var query;
        var value = document.getElementById("select_query_esterne").value;
        // selezioniamo i dati opportuni per popolare la seconda combobox in base al value della voce selezionata nella prima
        if(value == 1) {
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            select ?nomeGiocatore where {
                ?giocatore rdf:type Basketball:Giocatore;
                           Basketball:NomeCognomePersona ?nomeGiocatore.
            }`;
        } else if(value == 2) {
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            select ?squadra where {
                ?squadraT rdf:type Basketball:Squadra;
                         Basketball:possiedePalazzetto ?palazzetto;
                         Basketball:NomeSquadra ?squadra
            }`;
        }
        // richiesta all'endpoint che utilizza una della due query costruite in precedenza
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
                    opt.value = element;
                    opt.innerHTML = element;
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
        var value = document.getElementById("select_query_esterne").value;
        var query_value = document.getElementById("results_select").value;
        var query = ``;
        // costruzione della query finale parametrizzata in base al valore della voce selezionata
        if(value == 1) {
            var nomeGicatore = query_value;
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
            PREFIX schema: <http://schema.org/>
            select ?wikidataInfo ?img ?descrizione where {
                {
                    select ?item ?descrizione where {
                        ?giocatore rdf:type Basketball:Giocatore;
                            Basketball:NomeCognomePersona 
                            "` + nomeGicatore + `";
                            rdfs:comment ?descrizione;
                            rdfs:label ?nomeGiocatore.
                        bind(strlang(str(?nomeGiocatore), "it") 
                            as ?namePlayer).
                        service <https://query.wikidata.org/sparql> {
                            optional {
                                ?item rdfs:label ?namePlayer.
                            }
                        } 
                    } limit 1
                }
                service <https://query.wikidata.org/sparql> {
                    optional {
                        ?item <http://www.wikidata.org/prop/direct/P18> ?img;
                            schema:description ?wikidataInfo;
                    }
                }
                filter(lang(?wikidataInfo) = "it").
            }
            `;
        } else if(value == 2) {
            var nomeSquadra = query_value;
            query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX Basketball: <http://www.semanticweb.org/ModSem/Basketball#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
            PREFIX schema: <http://schema.org/>
            PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
            select ?nomePalazzetto ?img ?wikidataInfo where {
                {
                    select ?palazzetto ?item ?nomePalazzetto where {
                      ?squadra rdf:type Basketball:Squadra;
                            Basketball:NomeSquadra "` + nomeSquadra + `";
                            Basketball:possiedePalazzetto ?palazzetto.
                      ?palazzetto Basketball:PlaceName ?nomePalazzetto.
                      bind(STRLANG(str(?nomePalazzetto), "it") as ?nameArena).
                      service <https://query.wikidata.org/sparql> {
                        optional {
                            {?item rdfs:label ?nameArena.}
                            UNION
                            {?item skos:altLabel ?nameArena.}
                        }
                      }
                    }  limit 1
                }
                service <https://query.wikidata.org/sparql> {
                    optional {
                        ?item <http://www.wikidata.org/prop/direct/P18> ?img;
                            schema:description ?wikidataInfo;
                    }
                }
                filter(lang(?wikidataInfo) = "it").
            } limit 1`;
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
                    if(i == 1 && value == 2){
                        // serve per rimuovere le virgole all'interno delle stringhe restituite dall'enpoint,
                        // in quanto le virgole sono state utilizzate per splittare i valori inseriti nel campo value delle option
                        // che popolano le combobox
                        if(element.split(',').length == 4){
                            var checkComma = element.split('"');
                            var newStr = checkComma[1].replace(',','-');
                            element = checkComma[0] + newStr + checkComma[2];
                        }
                    } 
                    var dataRow = element.split(',');
                    dataRow.forEach(el => {
                        el = el.replace('\r', '');
                        // le virgole che erano state rimosse in precedenza vengono reinserite
                        el = el.replace('-',',');
                        if(i == 0) {
                            tr.append("<th>" + el + "</th>");
                            thead.append(tr);
                        } else {
                            // costruzione del tag che conterrà l'immagine restituita
                            if(el.split('.jpg').length == 2 || el.split('.png').length == 2){
                                var img = $("<img>");
                                img.attr("src", el).height("auto").width(200);
                                var td = $("<td>").append(img);
                                tr.append(td);
                            } else{
                                tr.append("<td>" + el + "</td>");
                            }
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