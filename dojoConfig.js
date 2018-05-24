var locationPath = window.location.pathname.replace(/\/[^\/]+$/, '/');

window.dojoConfig = {
    deps: ['app/main'],
    packages: [{
            name: 'app',
            location: locationPath + '/app',
            main: 'main'
        }, {
            name: 'app',
            location: 'https://ialixandroae.github.io/geodev-dashboard/' + '/app',
            main: 'main'
        }]
};

