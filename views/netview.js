
////////////////////
//NET VIEW
var dbresults = { "nodes": [], "links": [] };
var mouseCoordinates = [0, 0];
var selectedNode = null;
var clickOnAddNewTag = false;
var clickOnAddNewPost = false;
var existingTagArray = [];

linkifyOptions = {
    attributes: null,
    className: 'linkified',
    defaultProtocol: 'http',
    events: null,
    format: function (value, type) {
        return value;
    },
    formatHref: function (href, type) {
        return href;
    },
    ignoreTags: [],
    nl2br: false,
    tagName: 'a',
    target: {
        url: '_blank'
    },
    validate: true
};

function clickNewPostButton() {
    closeAllFrames();
    if (clickOnAddNewPost == false) {
        document.getElementById('submitnew').style.display = "block";
        document.getElementById('uploadNewPostButton').innerHTML = "-";
        clickOnAddNewPost = true;
    } else {
        document.getElementById('uploadNewPostButton').innerHTML = "+";
        clickOnAddNewPost = false;
    }
}

function displayStatus(message) {
    //
    document.getElementById("statusbar").outerHTML = '<marquee behavior="slide" direction="left" scrollamount="20" id="statusbar">' + message + '</marquee>';
}

function sendNewPostToServer() {
    var last3chars = document.getElementById('userInputtedContent').value.slice(-3);
    var typeOfUpload = "text";
    if (last3chars == "jpg" || last3chars == "png" || last3chars == "gif") {
        typeOfUpload = "pic";
    }
    if (document.getElementById('tag2').value == "") {
        socket.emit('sendNewPostToServer1', {
            nodename: document.getElementById('nodename').value,
            nodecontent: document.getElementById('userInputtedContent').value,
            tag1: document.getElementById('tag1').value.toLowerCase(),
            type: typeOfUpload
        });
    } else {
        socket.emit('sendNewPostToServer2', {
            nodename: document.getElementById('nodename').value,
            nodecontent: document.getElementById('userInputtedContent').value,
            tag1: document.getElementById('tag1').value.toLowerCase(),
            tag2: document.getElementById('tag2').value.toLowerCase(),
            type: typeOfUpload
        });
    }
    closeAllFrames();
    document.getElementById('uploadNewPostButton').innerHTML = "+";
    clickOnAddNewPost = false;
    displayStatus("Post uploaded successfully");
    $("svg").empty();
    document.getElementById('nodename').value = "";
    document.getElementById('userInputtedContent').value = "";
    document.getElementById('tag1').value = "";
    document.getElementById('tag2').value = "";
    socket.emit('retrieveDatabase');
}

function upvoteTag() {
    socket.emit('upvoteTag', {
        nodename: document.getElementById('postNameInModal').innerHTML,
        nodecontent: document.getElementById('contentInModal').innerHTML,
        tag1: document.getElementById('tagNameInModal').innerHTML
    });
    document.getElementById('upvoteTagModal').style.display = "none";
    displayStatus("Tag successfully upvoted");
}

function upvotePost() {
    socket.emit('upvotePost', {
        nodename: document.getElementById('postNameInModalPostOnly').innerHTML,
        nodecontent: document.getElementById('contentInModal').innerHTML
    });
    document.getElementById('previewframe').style.display = "none";
    displayStatus("Post successfully upvoted");
}

function tagPost() {
    var newTagInput = document.getElementById('newTagInput');
    if (clickOnAddNewTag == true) {
        if (existingTagArray.indexOf(newTagInput.value.toLowerCase()) === -1) {
            socket.emit('tagPost', {
                nodename: document.getElementById('postNameInModalPostOnly').innerHTML,
                nodecontent: document.getElementById('contentInModal').innerHTML,
                newtag: newTagInput.value.toLowerCase()
            });
            displayStatus("Tag added to post");
        } else {
            socket.emit('upvoteTag', {
                nodename: document.getElementById('postNameInModalPostOnly').innerHTML,
                nodecontent: document.getElementById('contentInModal').innerHTML,
                tag1: newTagInput.value.toLowerCase()
            });
            displayStatus("Tag already existed for this post and was upvoted");
        }
        newTagInput.value = "";
        newTagInput.style.display = "none";
        document.getElementById("tagIt").innerHTML = "Tag it";
        document.getElementById('previewframe').style.display = "none";
        clickOnAddNewTag = false;
    } else {
        newTagInput.style.display = "block";
        document.getElementById("tagIt").innerHTML = "Submit tag?";
        clickOnAddNewTag = true;
    }
    clickOnAddNewPost = false;
    document.getElementById('uploadNewPostButton').innerHTML = "+";
}

function closeAllFrames() {
    var newTagInput = document.getElementById("newTagInput");
    newTagInput.value = "";
    newTagInput.style.display = "none";
    clickOnAddNewTag = false;
    document.getElementById("tagIt").innerHTML = "Tag it";
    document.getElementById("submitnew").style.display = "none";
    document.getElementById('previewframe').style.display = "none";
    document.getElementById('upvoteTagModal').style.display = "none";
}

var inputs = $(".submissionslot");

var validateInputs = function validateInputs(inputs) {
    var validForm = true;
    inputs.each(function (index) {
        var input = $(this);
        if (input.val() == "") {
            $("#upload").attr("disabled", "disabled");
            validForm = false;
        }
    });
    return validForm;
};

inputs.change(function () {
    if (validateInputs(inputs)) {
        document.getElementById("upload").removeAttribute("disabled");
    }
});

var text_truncate = function (str, length, ending) {
    if (length == null) {
        length = 100;
    }
    if (ending == null) {
        ending = '...';
    }
    //console.log(String(str));
    if (str !== null) {
        //console.log("STRING IS NOT NULL");
        if (str.length > length) {
            //console.log(str.substring(0, length - ending.length) + ending);
            return str.substring(0, length - ending.length) + ending;
        } else {
            return str;
        }
    } else {
        //console.log("STRING IS NULL");
        return "null";
    }
};

var previewContent = document.getElementById("previewContent");

function handleRetrievedDatabase(results) {

    var promise1 = new Promise(function (resolve, reject) {
        console.log("DBRESULTSNODES");
        console.log(dbresults.nodes);
        //0 = id, 1 = upvotes, 2 = content, 3 = tag from results array
        for (let i = 0; i < results.length; i++) {
            k = i + 1;
            var foundPrev = false;
            var thisPostID = results[i][0];
            if (thisPostID == undefined) {
                continue;
            }
            for (obj of Object.values(dbresults.nodes)) {
                if (obj.id == thisPostID) {
                    foundPrev = true;
                    thisPostID = obj.id;
                    break;
                }
            }
            if (foundPrev == false) {
                dbresults.nodes.push({ id: thisPostID, upvotes: results[i][1], content: results[i][2], img: results[i][5] });
            }
            if (results[k] == undefined) {
                continue;
            } else {
                var thisNextPostID = results[k][0];
                for (obj of Object.values(dbresults.nodes)) {
                    if (obj.id == thisNextPostID) {
                        foundPrev = true;
                        thisNextPostID = obj.id;
                        break;
                    }
                }
                var thisPostTag = results[i][3];
                //IF THIS POSTS TAG IS IDENTICAL TO THE NEXT POSTS TAG
                if (thisPostTag == results[k][3] && thisNextPostID !== null) {
                    //THEN CHECK IF THAT TAG IS ALREADY IN THE EXISTING TAG ARRAY. IF NOT? PUSH IT TO THAT LIST
                    existingTagArray.indexOf(thisPostTag) === -1 ? existingTagArray.push(thisPostTag) : console.log("This item already exists");
                    //BECAUSE THERE MUST BE AT LEAST TWO POSTS WITH THE SAME TAG FOR A LINK TO EXIST, 
                    dbresults.links.push({ source: thisPostID, target: thisNextPostID, tag: thisPostTag });
                }
            }
        }

        resolve(dbresults);
    });



    promise1.then(function (data) {

        var margin = { top: 10, right: 40, bottom: 30, left: 30 },
            width = 450 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
        var svg = d3.select("svg")
            .attr("width", 1900)
            .attr("height", 1900)
            .on("mousemove", mousemove);
        console.log(d3);
        console.log("PROMISE1THEN START");
        console.log(data);

        var nodeIndexToIdDict = {}
        for (indexid in data.nodes) {
            nodeIndexToIdDict[data.nodes[indexid]["id"]] = parseInt(indexid);
        }
        console.log(nodeIndexToIdDict);
        var neoLinks = [];
        //console.log(data.links);
        for (linky in data.links) {
            var templink = {};
            //console.log(data.links[linky]["source"]);
            //console.log(data.links[linky]["source"]);
            var idToConvert = data.links[linky]["source"];
            var newidToConvert = data.links[linky]["target"];
            //console.log(nodeIndexToIdDict[data.links[linky]["source"]]);
            templink["source"] = parseInt(nodeIndexToIdDict[idToConvert]);
            //data.links[linky]["source"] = nodeIndexToIdDict[data.links[linky]["source"]];
            //data.links[linky]["target"] = nodeIndexToIdDict[data.links[linky]["target"]];
            templink["target"] = parseInt(nodeIndexToIdDict[newidToConvert]);
            templink["tag"] = data.links[linky]["tag"];
            neoLinks.push(templink);

        }
        console.log(neoLinks);
        //const links = data.links.map(d => ({ ...d }));
        const links = neoLinks;//.map(d => ({ ...d }));
        const nodes = data.nodes.map(d => ({ ...d }));

        var node;

        const link = svg.selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke", "#fff")
            .attr("stroke-opacity", 0.9)
            .attr("stroke-width", 1);


        var pic = svg.selectAll("g.node")
            .data(nodes)
            .enter().append("svg:g")
            .attr("class", "node")
        //var pics = pic.append("defs");
        pic.append('pattern')
            .attr("id", function (d) { return "image" + d.img; })
            .attr("width", 1)
            .attr("height", 1)
            .append("svg:image")
            .attr("xlink:href", function (d) { return '/uploaded/' + d.img; })
            .attr("width", 100)
            .attr("height", 150)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        var node = svg.selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            //.attr("fill", d3.color("#cccccc"))
            .style("fill", function (d) {
                console.log(d); return (d.img.slice(-3) == ('jpg' || 'png' || 'gif') || (d.img == 'officialunofficialplaceholderlogo.jpg')) ? "url(#image" + d.img + ")" : "#ACBCAD";
            })
            //.attr("fill", function (d) { return "url(#image" + d.img + ")" })
            .attr("r", function (d) { console.log("TEST"); return (d.upvotes != null || d.upvotes != 0) ? 5 * d.upvotes : 5; })
            .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; })
            .on("mousedown", clickOnNode)
            .on("mouseover", function (d) {
                d3.select(this).style("cursor", "pointer");
            });


        var path = svg.selectAll("path")
            .data(links)
            .enter().append("path")
            .attr("class", "linkpath")
            .attr("id", function (d, i) { return "pathId_" + i; })
            .attr("marker-end", function (d) { return "url(#" + d.tag + ")"; });

        var linktext = svg.selectAll("text")
            .data(links)
            .enter().append("text")
            .attr("class", "gLink")
            .style("font-size", "11px")
            .style("font-family", "sans-serif")
            .attr("x", "50")
            .attr("y", "-4")
            .attr("text-anchor", "start")
            .style("fill", "#f1d141")
            .append("textPath")
            .attr("xlink:href", function (d, i) { return "#pathId_" + i; })
            .text(function (d) { return d.tag; })
            .on("mousedown", clickOnTag);

        var simulation = d3.forceSimulation(nodes)
            .force("collision", d3.forceCollide().radius(1))
            .force("link", d3.forceLink(links).id(function (d, i) { console.log(d); console.log(i); return i; }))
            .force("charge", d3.forceManyBody().strength(-400).distanceMin(13))
            .force("center", d3.forceCenter(600, 600));

        function ticked() {
            node.attr("cx", function (d) { return d.x; }).attr("cy", function (d) { return d.y; });
            postTitle.attr("x", function (d) { return d.x; }).attr("y", function (d) { return d.y; });
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            path.attr("d", function (d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y;
                return "M " + d.source.x + " " + d.source.y + " L " + d.target.x + " " + d.target.y;
            });
        }

        simulation.nodes(nodes).on("tick", ticked);
        console.log(links);

        var postTitle = svg.selectAll(".mytext")
            .data(nodes)
            .enter().append("text")
            .on("mousedown", clickOnNode)
            .style("fill", "#cccccc")
            .attr("width", "10")
            .attr("height", "10")
            .style("fill", "#ffd24d")
            .text(function (d) { return text_truncate(d.content, 20); });

        // svg.selectAll(".nodes").data(data.nodes).enter()
        // .append('svg:image')
        //   .attr('xlink:href', function(d){if((/\.(gif|jpg|jpeg|tiff|png)$/i).test(d.img)){return "uploaded/"+d.img;}})
        //   .attr("x", function(d){console.log(d);console.log(d.x);return d.x;})
        //   .attr("y", function(d){return d.y;})
        //   .attr("width", "50")
        //   .attr("height", "50");


        // Define drag beavior
        function dragstarted(d) {
            //simulation.stop();
            if (!d3.event.active) { simulation.alphaTarget(0.3).restart(); }
            d.fx = d.x;
            d.fy = d.y;
        }
        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }
        function dragended(d) {
            if (!d3.event.active) { simulation.alphaTarget(0); }
            d.fx = null;
            d.fy = null;
        }
        function dragmove(d) {
            var x = d3.event.x;
            var y = d3.event.y;
            d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
        }
        var drag = d3.behavior.drag().on("drag", dragmove).origin(function () { return { x: 0, y: 0 }; });


        function mousemove() {
            mouseCoordinates = d3.pointer(this);
            //cursor.attr("transform", "translate(" + String(d3.mouse(this)) + ")");
        }
        function mouseoverNode(d, i) {
            var thisObject = d3.select(this)["_groups"][0][0];
            d3.select(node.nodes()[i])
                .transition()
                .attr("r", 2 * thisObject["attributes"][0]["nodeValue"])
                .duration(500);
        }
        function mouseoutNode(d, i) {
            console.log(node);
            console.log(d);
            console.log(i);
            var thisObject = d3.select(this)["_groups"][0][0];
            d3.select(node.nodes()[i])
                .transition()
                .attr("r", thisObject["attributes"][0]["nodeValue"] / 2)
                .duration(500);
        }
        function clickOnTag(d, i) {
            //console.log(d);
            closeAllFrames();
            document.getElementById('uploadNewPostButton').innerHTML = "-";
            clickOnAddNewPost = true;
            var upvoteModalElement = document.getElementById('upvoteTagModal').style;
            document.getElementById('tagNameInModal').innerHTML = d.tag;
            document.getElementById('contentInModal').innerHTML = d.source.content;
            document.getElementById('postNameInModal').innerHTML = d.source.id;
            //upvoteModalElement.left = String(mouseCoordinates[0])+"px";
            //upvoteModalElement.top = String(mouseCoordinates[1])+"px";
            upvoteModalElement.display = "block";
        }
        function clickOnNode(d, i) {
            //previewFrame.innerHTML = linkifyHtml(d.content, linkifyOptions);
            //linkifyStr(previewFrame, linkifyOptions);
            window.location.href = '/?post=' + String(d.id);
            closeAllFrames();
            clickOnAddNewPost = true;
            document.getElementById('uploadNewPostButton').innerHTML = "-";
            document.getElementById('postNameInModalPostOnly').innerHTML = d.id;
            document.getElementById('contentInModal').innerHTML = d.content;
            previewContent.innerHTML = "<a href=" + d.content + ">" + d.content + "</a>";
            document.getElementById('previewframe').style.display = "block";
        }
        function restart() {
            node = node.data(data.nodes);
            node.enter().insert("circle", ".cursor")
                .attr("class", "node")
                .attr("r", 5)
                .on("mousedown", mousedownNode);
            node.exit()
                .remove();

            link = link.data(data.links);
            link.enter().insert("line", ".node")
                .attr("class", "link");
            link.exit()
                .remove();

            simulation
                .nodes(data.nodes)
                .on("tick", ticked);
            simulation.force("link")
                .links(data.links);
        }


        svg
            .call(drag);
        function dragstarted() {
            d3.select(this).raise();
            g.attr("cursor", "grabbing");
        }

        function dragged(event, d) {
            d3.select(this).attr("cx", d.x = event.x).attr("cy", d.y = event.y);
        }

        function dragended() {
            g.attr("cursor", "grab");
        }


    });
}

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus -= 1;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) { /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    document.addEventListener("click", function (e) { closeAllLists(e.target); }); /*execute a function when someone clicks in the document:*/
}

autocomplete(document.getElementById("newTagInput"), existingTagArray);
autocomplete(document.getElementById("tag1"), existingTagArray);
autocomplete(document.getElementById("tag2"), existingTagArray);