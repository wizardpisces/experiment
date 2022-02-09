import { h } from 'mini-vue'
import App from './App'
export default {
    setup() {
        return () => (
            <html>
                <head>
                    <meta charset="UTF-8" />
                    <link rel="icon" href="data:" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <script type="module" src="/@vite/client"></script>
                    <title>mini</title>
                </head>
                <body>
                    <div id="app"><App /></div>
                    <script type="module" src="/src/entry-client.ts"></script>
                </body>
            </html>
            // <App></App>
        )
    }
}
