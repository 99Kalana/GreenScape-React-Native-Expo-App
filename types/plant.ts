export interface Plant {
    id?: string;
    userId: string;
    name: string;
    species: string;
    lastWatered: Date;
    lastFertilized: Date;
    careNotes?: string;
    imageUrl?: string | null;
}