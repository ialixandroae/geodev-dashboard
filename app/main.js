require([
    'esri/portal/Portal',
    'esri/identity/OAuthInfo',
    'esri/identity/IdentityManager',
    'esri/portal/PortalQueryParams',
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/Locate",
    'dojo/domReady!'
], function (
    Portal, OAuthInfo, esriId, PortalQueryParams, Map, MapView, Locate
) {
    const mainPageDivMap = document.getElementById('mainPageMap');
    const mainPageDivMapMobile = document.getElementById('mainPageMapMobile');
    const mainPageContentDiv = document.getElementById('mainPageContent');
    const signInBtn = document.getElementById('sign-in');
    const signInBtnMobile = document.getElementById('sign-in-mobile');
    const signOutBtn = document.getElementById('sign-out');
    const signOutBtnMobile = document.getElementById('sign-out-mobile');
    const userName = document.getElementById('userName');
    const footer = document.getElementById('footer');
    const dashboardContent = document.getElementById('dashboardContent');

    var info = new OAuthInfo({
            // Swap this ID out with registered application ID
        appId: 'ilrGfLSnRZtd325f',
            popup: false
        });

    esriId.registerOAuthInfos([info]);

    esriId.checkSignInStatus(`${info.portalUrl}/sharing`).then(
        function () {
            signOutBtn.style.display = 'inline-block';
            signOutBtnMobile.style.display = 'inline-block';
            footer.style.display = 'block';
            mainPageContentDiv.style.display = 'none';
            signInBtn.style.display = 'none';
            signInBtnMobile.style.display = 'none';
            dashboardContent.style.display = 'block';
            getPortalDataAll();
            getPortalDataMaps();
            getPortalDataApps();
            createTable();
            createChart();
        }
    ).otherwise(
        function () {
            // Anonymous view
            dashboardContent.style.display = 'none';
            mainPageContentDiv.style.display = 'block';
            signOutBtn.style.display = 'none';
            signOutBtnMobile.style.display = 'none';
        }
    );

    document.getElementById('sign-in').addEventListener('click', function () {
        // user will be redirected to OAuth Sign In page
        esriId.getCredential(`${info.portalUrl}/sharing`);
    });

    document.getElementById('sign-in-mobile').addEventListener('click', function () {
        // user will be redirected to OAuth Sign In page
        esriId.getCredential(`${info.portalUrl}/sharing`);
    });

    document.getElementById('sign-out').addEventListener('click', function () {
        esriId.destroyCredentials();
        window.location.reload();
    });

    document.getElementById('sign-out-mobile').addEventListener('click', function () {
        esriId.destroyCredentials();
        window.location.reload();
    });

    addMainPageMap(mainPageDivMap);
    addMainPageMap(mainPageDivMapMobile);
    seachAndFilter( document.getElementById('searchAll'), 
                    document.getElementById('resourcesCardDiv'), 
                    document.getElementsByClassName('card-wide'),
                    document.getElementById('resourcesTotal'));

    seachAndFilter(document.getElementById('searchMaps'),
        document.getElementById('mapsCardDiv'),
        document.getElementsByClassName('card-maps'),
        document.getElementById('mapsTotal'));

    seachAndFilter(document.getElementById('searchApps'),
        document.getElementById('appsCardDiv'),
        document.getElementsByClassName('card-apps'),
        document.getElementById('appsTotal'));


    function addMainPageMap(divElement){
        let lat;
        let long;

        if ("geolocation" in navigator) {
            /* geolocation is available */
            navigator.geolocation.getCurrentPosition(function (position) {
                // console.log(position);
                lat = position.coords.latitude;
                long = position.coords.longitude;
            });
        } else {
            /* geolocation IS NOT available */
            navigator.geolocation.getCurrentPosition(function (position) {
                // console.log(position);
                lat = position.coords.latitude;
                long = position.coords.longitude;
            });
        }

        const map = new Map({
            basemap: "streets"
        });

        const view = new MapView({
            container: divElement,  // Reference to the DOM node that will contain the view
            map: map,
            zoom: 4,
            center: [25, 45]              // References the map object created in step 3
        });

        const locateWidget = new Locate({
            view: view,   // Attaches the Locate button to the view
            goToLocationEnabled: true
        });

        view.when(function() {
            locateWidget.locate();
        });
    };

    function getPortalDataAll(){
        var portal = new Portal();
        // Setting authMode to immediate signs the user in once loaded
        portal.authMode = 'immediate';
        // Once loaded, user is signed in
        portal.load().then(function () {
            // Create query parameters for the portal search
            var queryParams = new PortalQueryParams({
                // query: `owner:${portal.user.username} AND type:Web Mapping Application`,
                query: `owner:${portal.user.username}`,
                sortField: 'numViews',
                sortOrder: 'desc',
                num: 100
            });

            
            userName.innerHTML = portal.user.username;
            // Query the items based on the queryParams created from portal above
            portal.queryItems(queryParams).then(function(data){
                const resources = data.results;
                document.getElementById('resourcesTotal').innerHTML = data.total;

                resources.map(function(resource) {
                    
                    const resourceInfo = resource.resourceInfo;

                    let urlButton = resource.url == null 
                        ?
                        `<div href="#" target="_blank" class="btn btn-fill btn-red leader-1">No URL available</div></div>`
                        :
                        `<a href="${resource.url}" target="_blank" class="btn btn-fill leader-1">View</a></div>`;

                    let cardElement =
                        '<div class="card card-wide" style="margin-top: 5px; margin-bottom:5px;">' +
                        '<figure class="card-wide-image-wrap">' +
                        `<img class="card-image" src="${resource.thumbnailUrl}">` +
                        `<div class="card-image-caption">${resource.created}</div></figure>` +
                        '<div class="card-content">' +
                        `<h4 class="trailer-half"><a class="itemTitle" href="${resource.url == null ? '#' : resource.url}">${resource.title}</a></h4>` +
                        `<p class="font-size--1 card-last">${resourceInfo.description == null ? 'No description' : resourceInfo.description}</p>` +
                        '<hr>' +
                        `<p class="font-size--1 card-last">${resource.type}</p>` +
                        urlButton;

                    document.getElementById('resourcesCardDiv').innerHTML += cardElement;
                });
            });
        });
    };

    function getPortalDataMaps(){

        var portal = new Portal();
        // Setting authMode to immediate signs the user in once loaded
        portal.authMode = 'immediate';
        // Once loaded, user is signed in
        portal.load().then(function () {
            // Create query parameters for the portal search
            var queryParams = new PortalQueryParams({
                query: `owner:${portal.user.username} AND type:Web Map`,
                sortField: 'numViews',
                sortOrder: 'desc',
                num: 100
            });

            // Query the items based on the queryParams created from portal above
            portal.queryItems(queryParams).then(function (data) {
                // console.log(data);
                const resources = data.results;
                let count = 0;
                resources.map(function (resource) {
                    const resourceInfo = resource.resourceInfo;
                    if(resourceInfo.type === 'Web Map'){
                        count++;
                        let urlButton = resource.url == null
                            ?
                            `<div href="#" target="_blank" class="btn btn-fill btn-red leader-1">No URL available</div></div>`
                            :
                            `<a href="${resource.url}" target="_blank" class="btn btn-fill leader-1">View</a></div>`;
                        let cardElement =
                            '<div class="card block trailer-1 card-maps" style="margin-top: 5px; margin-bottom:5px;">' +
                            '<figure class="card-image-wrap">' +
                            `<img class="card-image" src="${resource.thumbnailUrl}">` +
                            `<figcaption class="card-image-caption">${resource.created}</figcaption></figure>` +
                            '<div class="card-content">' +
                            `<h4><a class="itemTitle" href="${resource.url == null ? '#' : resource.url}">${resource.title}</a></h4>` +
                            `<p class="font-size--1 card-last">${resourceInfo.description == null ? 'No description' : resourceInfo.description}</p>` +
                            `<p class="font-size--1 card-last">${resource.type}</p>` +
                            urlButton;

                        document.getElementById('mapsCardDiv').innerHTML += cardElement;
                    };  
                });
                document.getElementById('mapsTotal').innerHTML = count;
            });
        });
    };

    function getPortalDataApps() {
        var portal = new Portal();
        // Setting authMode to immediate signs the user in once loaded
        portal.authMode = 'immediate';
        // Once loaded, user is signed in
        portal.load().then(function () {
            // Create query parameters for the portal search
            var queryParams = new PortalQueryParams({
                query: `owner:${portal.user.username} AND type:Web Map`,
                sortField: 'numViews',
                sortOrder: 'desc',
                num: 100
            });

            // Query the items based on the queryParams created from portal above
            portal.queryItems(queryParams).then(function (data) {
                // console.log(data);
                const resources = data.results;
                let count = 0;
                resources.map(function (resource) {
                    const resourceInfo = resource.resourceInfo;
                    if (resourceInfo.type === 'Web Mapping Application') {
                        count++;
                        let urlButton = resource.url == null
                            ?
                            `<div href="#" target="_blank" class="btn btn-fill btn-red leader-1">No URL available</div></div>`
                            :
                            `<a href="${resource.url}" target="_blank" class="btn btn-fill leader-1">View</a></div>`;
                        let cardElement =
                            '<div class="card block trailer-1 card-apps" style="margin-top: 5px; margin-bottom:5px;">' +
                            '<figure class="card-image-wrap">' +
                            `<img class="card-image" src="${resource.thumbnailUrl}">` +
                            `<figcaption class="card-image-caption">${resource.created}</figcaption></figure>` +
                            '<div class="card-content">' +
                            `<h4><a class="itemTitle" href="${resource.url == null ? '#' : resource.url}">${resource.title}</a></h4>` +
                            `<p class="font-size--1 card-last">${resourceInfo.description == null ? 'No description' : resourceInfo.description}</p>` +
                            `<p class="font-size--1 card-last">${resource.type}</p>` +
                            urlButton;

                        document.getElementById('appsCardDiv').innerHTML += cardElement;
                    };
                });
                document.getElementById('appsTotal').innerHTML = count;
            });
        }); 
    };

    function createTable(){
        const resourcesTable = document.getElementById('resourcesTableBody');

        const portal = new Portal();
        // Setting authMode to immediate signs the user in once loaded
        portal.authMode = 'immediate';
        // Once loaded, user is signed in
        portal.load().then(function () {
            const queryParams = new PortalQueryParams({
                query: `owner:${portal.user.username}`,
                sortField: 'numViews',
                sortOrder: 'desc',
                num: 100
            });

            portal.queryItems(queryParams).then(function (data) {
                
                data.results.map(function(item, index) {
                    // Nu functioneaza
                    console.log(item.title, index+1);
                    let row = document.createElement("tr");
                    let cell1 = document.createElement("td");
                    cell1.innerText = index+1;
                    row.appendChild(cell1);
                    resourcesTable.appendChild(row);
                    
                    let cell2 = document.createElement("td");
                    cell2.innerText = item.title.toString();
                    row.appendChild(cell2);
                    resourcesTable.appendChild(row);

                    let cell3 = document.createElement("td");
                    cell3.innerText = item.type.toString();
                    row.appendChild(cell3);
                    resourcesTable.appendChild(row);

                    let cell4 = document.createElement("td");
                    let itemData = item.created.toString();
                    itemData = itemData.split(" ")[1] + " " + itemData.split(" ")[2] + " " + itemData.split(" ")[3];
                    cell4.innerText = itemData.toString();
                    row.appendChild(cell4);
                    resourcesTable.appendChild(row);

                    let cell5 = document.createElement("td");
                    let url = item.url == null ? 'No URL available' : '<a href=' + item.url + '>' + item.url + '</a>';
                    cell5.innerHTML = url;
                    row.appendChild(cell5);
                    resourcesTable.appendChild(row);

                });
            });

        });

    };

    function createChart() {
        let itemTypes = [];
        let typesOccurence = {};
        let itemTypesOccurence = [];
        let itemTypesDataOccurence = {};
        let itemTypeDataList = [];
        let itemTypesDataOccurenceKey = [];
        let itemTypesDataOccurenceValue = [];

        const resourcesTable = document.getElementById('resourcesTableBody');

        const portal = new Portal();
        // Setting authMode to immediate signs the user in once loaded
        portal.authMode = 'immediate';
        // Once loaded, user is signed in
        portal.load().then(function () {
            // Create query parameters for the portal search
            const queryParams = new PortalQueryParams({
                query: `owner:${portal.user.username}`,
                sortField: 'numViews',
                sortOrder: 'desc',
                num: 100
            });

            // Query the items based on the queryParams created from portal above
            portal.queryItems(queryParams).then(function (data) {
                
                data.results.map(function(item) {
                    // console.log(item);

                    if(itemTypes.includes(item.type) == false) {
                        itemTypes.push(item.type);
                    }
                });

                data.results.map(function(item) {
                    if (item.type in typesOccurence){
                        typesOccurence[item.type] += 1;  
                    } else {
                        typesOccurence[item.type] = 1;  
                    }
                });

                for(prop in typesOccurence){
                    itemTypesOccurence.push(typesOccurence[prop]);
                };

                
                itemTypeDataList = data.results.map(function(item){
                    return item.created;
                })
                itemTypeDataList.sort(function(a,b) {
                    let da = new Date(a).getTime();
                    let db = new Date(b).getTime();
                    return da < db ? -1 :  da > db ? 1 : 0;
                });  
            
                itemTypeDataList.map(function (item) {
                    let itemData = item.toString();
                    itemData = itemData.split(" ")[1] + " " + itemData.split(" ")[2] + " " + itemData.split(" ")[3];
                    if (itemData in itemTypesDataOccurence) {
                        itemTypesDataOccurence[itemData] += 1;
                    } else {
                        itemTypesDataOccurence[itemData] = 1;
                    }
                });

                for(prop in itemTypesDataOccurence){
                    itemTypesDataOccurenceKey.push(prop);
                    itemTypesDataOccurenceValue.push(itemTypesDataOccurence[prop]);
                };
            
                // console.log(itemTypes);
                // console.log(typesOccurence);
                // console.log(itemTypesOccurence);
                
                // console.log(itemTypeDataList);
                // console.log(itemTypesDataOccurence);
            });
        });
        
        const myChart = document.getElementById('chart');

        const myBarChart = new Chart(myChart, {
            type: 'bar',
            data: {
                labels: itemTypes,
                datasets: [{
                    label: '# of Resources',
                    data: itemTypesOccurence,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                        'rgba(255, 159, 64, 0.5)',
                        'rgba(76,  122, 34, 0.5)',
                        'rgba(71,  103, 177, 0.5)',
                        'rgba(13,102,217, 0.5)',
                        'rgba(187,54,82, 0.5)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(76,  122, 34, 1)',
                        'rgba(71,  103, 177, 1)',
                        'rgba(13,102,217, 1)',
                        'rgba(187,54,82, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

        const myPieChart = document.getElementById('pieChart');

        const pieChart = new Chart(myPieChart, {
            type: 'doughnut',
            data: {
                labels: itemTypes,
                datasets: [{
                    label: '# of Resources',
                    data: itemTypesOccurence,
                    backgroundColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(76,  122, 34, 1)',
                        'rgba(71,  103, 177, 1)',
                        'rgba(13,102,217, 1)',
                        'rgba(187,54,82, 1)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 15,
                        bottom: 0
                    }
                }
            }
        });

        const myLineChart = document.getElementById('lineChart');
        
        const lineChart = new Chart(myLineChart, {
            type: 'line',
            data: {
                labels: itemTypesDataOccurenceKey,
                datasets: [{
                    label: '# of Resources by Time',
                    data: itemTypesDataOccurenceValue,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    lineTension: '0.2'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        });
    };

    function seachAndFilter(searchInput, allResourcesDiv, cardElements, resourcesValue){
        searchInput.addEventListener('keyup', function(event) {
            
            Array.from(cardElements).map(function (card) {
                card.style.display = 'none';
            });

            let char = searchInput.value.toLowerCase();
            let listaDiv = Array.from(allResourcesDiv.getElementsByClassName('itemTitle'));
            let listaDivFilter = listaDiv.filter(function(item){
                let title = item.innerText.toString().toLowerCase();
                return title.startsWith(char.toString());
            });
            
            resourcesValue.innerText = listaDivFilter.length;

            Array.from(cardElements).map(function(card){
                Array.from(listaDivFilter).map(function(item){
                    if(card.contains(item)){
                        console.log(card);
                        card.style.display = 'flex';
                    }
                });
            });
        });
    };
});