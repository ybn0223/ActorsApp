
export interface Actor{
    id: number,
    name: string,
    description: string,
    age: number,
    nationality: string,
    isActive: boolean,
    birthdate: string,
    profileImageUrl: string,
    relationshipStatus: string,
    hobbies: string[],
    extraInfo: ExtraInfo
}

interface ExtraInfo{
    id: number,
    pets?: string[], // ? hier "geen" zetten in Site
    children?: string[],
    favoriteDish: string,
    awards?: Array<string>,
    netWorth: number,
    hasOscar: boolean
}