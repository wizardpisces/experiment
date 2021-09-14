import AsyncApp from './application'
import compose from './compose'

import logger from './public-middleware/logger'
import responseTime from './public-middleware/response-time'
import serveStatic from './public-middleware/static'

export *  from './type'

const middleware = {
    logger,
    responseTime,
    serveStatic
}

export {
    compose,
    AsyncApp,
    middleware
}

export default AsyncApp