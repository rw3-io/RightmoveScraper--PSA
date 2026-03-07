
export interface PropertyTypeConfig {
    id: string;
    label: string;
    searchValues: string[]; // Values used in Rightmove Search URL (propertyTypes=...)
    dataValues: string[];   // Possible values returned by the scraper in 'type' field
}

export const PROPERTY_TYPES: PropertyTypeConfig[] = [
    {
        id: 'detached',
        label: 'Detached',
        searchValues: ['detached'],
        dataValues: ['Detached', 'Detached House', 'Detached Bungalow']
    },
    {
        id: 'semi-detached',
        label: 'Semi-Detached',
        searchValues: ['semi-detached'],
        dataValues: ['Semi-Detached', 'Semi-Detached House', 'Semi-Detached Bungalow']
    },
    {
        id: 'terraced',
        label: 'Terraced',
        searchValues: ['terraced'],
        dataValues: ['Terraced', 'Terraced House', 'End of Terrace', 'Mid Terrace']
    },
    {
        id: 'flats',
        label: 'Flats / Apartments',
        searchValues: ['flats'],
        dataValues: ['Flat', 'Apartment', 'Studio', 'Maisonette', 'Penthouse']
    },
    {
        id: 'bungalows',
        label: 'Bungalows',
        searchValues: ['bungalow'],
        dataValues: ['Bungalow', 'Detached Bungalow', 'Semi-Detached Bungalow', 'Terraced Bungalow']
    },
    {
        id: 'town-house',
        label: 'Town House',
        searchValues: ['terraced', 'semi-detached'], // Often categorized under these in search
        dataValues: ['Town House']
    },
    {
        id: 'cottage',
        label: 'Cottages',
        searchValues: ['detached', 'semi-detached', 'terraced'],
        dataValues: ['Cottage', 'Character Property']
    },
    {
        id: 'land',
        label: 'Land',
        searchValues: ['land'],
        dataValues: ['Land', 'Plot', 'Residential Development']
    },
    {
        id: 'commercial',
        label: 'Commercial',
        searchValues: ['commercial'],
        dataValues: ['Commercial Property', 'Office', 'Retail', 'Industrial', 'Leisure']
    }
];

/**
 * Strictly checks if a raw property type matches a target data value.
 * Prevents "semi-detached" from being broadly matched by "detached".
 */
export const isTypeMatch = (rawType: string, dv: string): boolean => {
    const raw = rawType.toLowerCase().trim();
    const target = dv.toLowerCase().trim();

    if (raw === target) return true;

    // Prevent cross-contamination where "Detached" catches "Semi-Detached"
    if (target.includes('detached') && !target.includes('semi') && !target.includes('link')) {
        if (raw.includes('semi') || raw.includes('link')) {
            return false;
        }
    }

    return raw.includes(target);
};

/**
 * Finds the primary label for a raw property type string from the scraper
 */
export const getNormalizedPropertyType = (rawType: string): string => {
    if (!rawType) return 'Other';
    
    const match = PROPERTY_TYPES.find(pt => 
        pt.dataValues.some(dv => isTypeMatch(rawType, dv))
    );
    
    return match ? match.label : rawType;
};
