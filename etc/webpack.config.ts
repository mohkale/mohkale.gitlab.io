import * as fs from 'fs';
import * as path from 'path';
import * as webpack from 'webpack';

// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
import TerserWebpackPlugin from 'terser-webpack-plugin';

const production = process.env.NODE_ENV === 'production';
// console.log('production is: ', production)
type WebpackConfigFunction = (env: String) => webpack.Configuration;

/**
 * resolve a path relative to the root directory of this project.
 *
 * @param args the remaining path vars passed to {@code path.resolve}.
 */
function pathResolve(...args: string[]): string {
    return path.resolve(__dirname, '..', ...args)
}

// function ls(dir: string, ext: string): string[] {
//     return fs.readdirSync(dir)
//         .filter(file => path.extname(file) === ext)
//         .map(file => path.join(dir, file));
// }

function lsRecursively(dir: string, ext: string): string[] {
    let files: string[] = [];

    fs.readdirSync(dir, {withFileTypes: true})
        .forEach(file => {
            let fullPath = path.join(dir, file.name);

            if (file.isDirectory()) {
                // get all files in the current subdirectory.
                files = files.concat(lsRecursively(fullPath, ext));
            } else if (path.extname(file.name) === ext) {
                files.push(fullPath);
            }
        });

    return files;
}

const excludes: string[] = [
    pathResolve('vendor', 'node'),
    pathResolve('node_modules')
]

const defaultConfig: webpack.Configuration = {
    mode: "development",
};

const scriptsConfig: WebpackConfigFunction = env => Object.assign({}, defaultConfig, {
    entry: {
        'ascii-gif': pathResolve('src', 'scripts', 'ascii-gif', 'index.ts'),
        'main':      pathResolve('src', 'scripts', 'main.ts'),
        'cv':        pathResolve('src', 'scripts', 'cv', 'index.ts'),
        'search':    pathResolve('src', 'scripts', 'search.ts'),
        // 'slideshow': pathResolve('src', 'scripts', 'slideshow.ts'),
    },

    // format of path where compiled files are dumped.
    output: {
        path: pathResolve("src", "assets", "scripts"),
        filename: "[name].bundle.js"
    },

    devtool: (env === "production") ? false : "inline-source-map",

    optimization: {
        minimize: env === "production",
        minimizer: [
            new TerserWebpackPlugin({
                terserOptions: {
                    output: {
                        comments: false,
                    },
                },
                extractComments: false,
            })
        ]
    },

    // resolvable file extension, used for imports.
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: pathResolve('var', 'babel'),
                        configFile: pathResolve('etc', 'babel.config')
                    }
                },
                exclude: excludes
            },
            {
                test: /\.tsx?/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            // configFile: pathResolve('etc', 'tsconfig.json'),
                            transpileOnly: true // see issue [[https://github.com/cypress-io/cypress/issues/2316][#2313]].
                        },
                    }
                ],
                exclude: excludes
            }
        ]
    }
});

const asciiGifEntries = lsRecursively(pathResolve('src', 'assets', 'ascii'), '.ant')
    .map(file => [path.basename(file, '.ant'), file])
    .reduce((acc, [ key, val ]) => Object.assign(acc, { [key]: val }), {});

const asciiGifConfig: webpack.Configuration = Object.assign({}, defaultConfig, {
    entry: asciiGifEntries,

    // webpack doesn't have the option to cancel file output. and it HAS TO
    // output javascript files. if it has to write something, just write
    // some dummy files to the var directory.
    output: {
        path: pathResolve('var', 'ascii'),
        filename: '[name].header'
    },

    module: {
        rules: [
            {
                test: /\.ant/,
                use: {
                    loader: pathResolve('src', 'scripts', 'ascii-gif', 'webpack.ts'),
                    options: {
                        output: {
                            extension: ".header"
                        }
                    }
                }
            }
        ]
    }
});

export default (env: string) => [scriptsConfig, asciiGifConfig].map(c => {
    if (c instanceof Function) {
        return (c as WebpackConfigFunction)(env);
    }

    return c;
});
