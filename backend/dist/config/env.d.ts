export declare const env: {
    node_env: string;
    port: number;
    api_base_url: string;
    db: {
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
        ssl: boolean;
    };
    JWT_SECRET: string;
    jwt: {
        secret: string;
        expiry: string;
    };
    apis: {
        economic: {
            key: string;
            url: string;
        };
        marketData: {
            key: string;
            url: string;
        };
        news: {
            key: string;
            url: string;
        };
        twelveData: string;
        finnhub: string;
        polygon: string;
        alphaVantage: string;
        currents: string;
        gnews: string;
        cryptoPanic: string;
        fred: string;
        cryptocompare: string;
    };
    log_level: string;
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
};
//# sourceMappingURL=env.d.ts.map