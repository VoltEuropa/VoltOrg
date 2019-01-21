//This part is run automatically when page is loaded
$(document).ready(function () {
    var csvdata = $("#csv-file").change(parseLocalData);
});

function generateNodes(rawData) {
    var data = rawData.sort(sortMembers);

    var nodes = [];
    var tagIds = {};

    for (var i = 0; i < data.length; i++) {
        var id, person, name, title, parentTag, tag, pid;

        id = i + 1;
        person = data[i];
        name = person.naam;
        title = person.titel;

        parentTag = getParentTag(person);
        tag = getLastElement(person);

        //if person is in the root group
        if (parentTag === "") {
            tagIds[tag] = id;

            nodes.push({
                id: id,
                tags: [tag],
                name: name,
                title: title,
                img: "https://balkangraph.com/js/img/empty-img-white.svg"
            });
        }
        //else if already people in that team.
        else if (tagIds[tag] !== undefined) {
            pid = tagIds[parentTag];

            nodes.push({
                id: id,
                pid: pid,
                tags: [tag],
                name: name,
                title: title,
                img: "https://balkangraph.com/js/img/empty-img-white.svg"
            });
        }
        //else if this person is the first of the group
        else {
            pid = tagIds[parentTag];
            tagIds[tag] = id;

            nodes.push({
                id: id,
                pid: pid,
                tags: [tag],
                name: name,
                title: title,
                img: "https://balkangraph.com/js/img/empty-img-white.svg"
            })
        }

    }

    return nodes;
}

function generateTags(data) {
    var tags = {};

    for (var i = 0; i < data.length; i++) {
        console.log(data[i]);
        var teamArr = data[i].team.split('/');

        for (var j = 0; j < teamArr.length; j++) {

            if (tags[teamArr[j]] === undefined) {
                tags[teamArr[j]] = {
                    group: true,
                    groupName: teamArr[j],
                    groupState: BALKANGraph.EXPAND,
                    template: "group_grey"
                };
            }

        }
    }

    return tags;
}

function sortMembers(a, b) {
    if (a.team < b.team)
        return -1;
    if (a.team > b.team)
        return 1;
    return 0;
}

function parseLocalData(evt) {
    console.log('Generating Volt..');

    var file = evt.target.files[0];

    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: function (data) {
            var csvdata = data.data;
            csvdata.pop(); //the last is always empty (bug)

            var tags = generateTags(csvdata);
            var nodes = generateNodes(csvdata);

            console.log(OrgChart.templates.ula.field_0);

            OrgChart.templates.myTemplate = Object.assign({}, OrgChart.templates.ula);
            OrgChart.templates.myTemplate.rippleRadius = OrgChart.templates.ula.rippleRadius;
            OrgChart.templates.myTemplate.rippleColor = OrgChart.templates.ula.rippleColor;
            OrgChart.templates.myTemplate.size = OrgChart.templates.ula.size;
            OrgChart.templates.myTemplate.node = '<rect x="0" y="0" height="120" width="250" fill="#ffffff" stroke-width="1" stroke="#703a92"></rect><line x1="0" y1="0" x2="250" y2="0" stroke-width="2" stroke="#703a92"></line>';
            OrgChart.templates.myTemplate.field_0 = '<text width="145" class="field_0" style="font-size: 18px;" fill="#703a92" x="100" y="55">{val}</text>';

            var chart = new OrgChart(document.getElementById("tree"), {
                template: "myTemplate",
                enableDragDrop: false,
                nodeMouseClickBehaviour: BALKANGraph.action.edit,
                menu: {
                    pdf: {
                        text: "Export PDF",
                        onClick: function(nodeId) {
                            chart.exportPDF("VoltOrganization.pdf", true, nodeId);
                        }
                    },
                    //png: {text: "Export PNG"}
                },
                /*nodeMenu: {
                    details: { text: "Details" },
                    edit: { text: "Edit" },
                    add: { text: "Add" },
                    remove: { text: "Remove" }
                },
                dragDropMenu: {
                    addInGroup: { text: "Add in group" },
                    addAsChild: { text: "Add as child" }
                },*/
                nodeBinding: {
                    field_0: "name",
                    field_1: "title",
                    img_0: "img"
                },
                tags: tags,
                nodes: nodes,
            });

            $('#setup').remove();
        }
    });
}

function getLastElement(person) {
    var array = person.team.split('/');
    return array[array.length - 1];
}

function getParentTag(person) {
    var array = person.team.split('/');

    if (array.length > 1) {
        return array[array.length - 2];
    } else {
        return "";
    }
}
