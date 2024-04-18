Hooks.on('renderTokenConfig', RingAura.showConfig);

const RingAura = {
    showConfig: function (a, b, c) {
        console.log(a, b, c);
    },
};
