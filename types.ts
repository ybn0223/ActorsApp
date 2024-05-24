
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

export interface ExtraInfo{
    id: number,
    pets?: string[], // ? hier "geen" zetten in Site
    children?: string[],
    favoriteDish: string,
    awards?: Array<string>,
    netWorth: string,
    hasOscar: boolean
}

export interface IUser{
    username: string,
    password: string,
    isAdmin: boolean
}