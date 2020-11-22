function makeMultipleWebworkersWork(config){
    // Change the output file format so that each worker gets a unique name
    config.output.filename = 'static/js/[name].bundle.js'
    // Now, we add a rule for processing workers
    const newRules = [{

        test: /\.worker\.(c|m)?[tj]s$/i,
        type: "javascript/auto",
        include:  config.module.rules[1].include,
        use: [
            {
                loader: "worker-loader",
            },
            {
                loader: "babel-loader",
                options: {
                    presets: ["@babel/preset-env"],
                },
            },
        ],
        // Here we append all the old rules
    },...config.module.rules]
    // now update Webpack's config with the new rules
    config.module.rules = newRules
    return config
}
module.exports =[
    makeMultipleWebworkersWork,
    /*Your other stuff goes here */
    [
        "use-babel-config",
        {
            "presets": [
                "react-app",
                [
                    "@babel/preset-typescript",
                    {
                        "allowNamespaces": true
                    }
                ]
            ],
            "plugins": [
                "const-enum"
            ]

        }

    ],
]