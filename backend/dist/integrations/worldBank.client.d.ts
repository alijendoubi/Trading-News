export interface WorldBankIndicator {
    id: string;
    name: string;
    sourceNote: string;
    sourceOrganization: string;
}
export interface WorldBankData {
    indicator: {
        id: string;
        value: string;
    };
    country: {
        id: string;
        value: string;
    };
    countryiso3code: string;
    date: string;
    value: number;
    unit: string;
    decimal: number;
}
/**
 * World Bank API Client
 * Completely free, no API key required
 * Provides global economic indicators
 */
export declare class WorldBankClient {
    private client;
    private cache;
    private cacheDuration;
    constructor();
    /**
     * Get indicator data for a country
     */
    getIndicator(countryCode: string, indicatorCode: string, startDate?: number, endDate?: number): Promise<WorldBankData[]>;
    /**
     * Get multiple indicators for a country
     */
    getMultipleIndicators(countryCode: string, indicatorCodes: string[], startDate?: number, endDate?: number): Promise<Record<string, WorldBankData[]>>;
    /**
     * Get GDP data
     */
    getGDP(countryCode?: string, years?: number): Promise<WorldBankData[]>;
    /**
     * Get inflation data (CPI)
     */
    getInflation(countryCode?: string, years?: number): Promise<WorldBankData[]>;
    /**
     * Get unemployment rate
     */
    getUnemployment(countryCode?: string, years?: number): Promise<WorldBankData[]>;
    /**
     * Get interest rate
     */
    getInterestRate(countryCode?: string, years?: number): Promise<WorldBankData[]>;
    /**
     * Search for indicators
     */
    searchIndicators(query: string): Promise<WorldBankIndicator[]>;
    /**
     * Get all countries
     */
    getCountries(): Promise<any[]>;
    /**
     * Cache helpers
     */
    private getFromCache;
    private setCache;
    clearCache(): void;
}
export declare const worldBankClient: WorldBankClient;
//# sourceMappingURL=worldBank.client.d.ts.map