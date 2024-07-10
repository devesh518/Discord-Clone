import { db } from "@/lib/db";

export const getOrCreateConversation = async (memberOneId: string, memberTwoId: string) => {
    let conversation = (await findConversation(memberOneId, memberTwoId)) || (await findConversation(memberTwoId, memberOneId))
    console.log("i am in conversation.ts");
    if(!conversation){
        conversation = await createNewConversation(memberOneId, memberTwoId)
        console.log("i am INSIDEEEEEEE conversation.ts");
    }
        
    return conversation
}

const findConversation = async (memberOneId: string, memberTwoId: string) => {
    try {
        return await db.conversation.findFirst({
            where: {
                AND: [
                    { memberOneId: memberOneId },
                    { memberTwoId: memberTwoId }
                ]
            },

            include: {
                memberOne: {
                    include: {
                        profile: true
                    }
                },
                memberTwo: {
                    include: {
                        profile: true
                    }
                }
            }
        })
    } catch(error) {
        return null;
    }
}

const createNewConversation = async (memberOneId: string, memberTwoId: string) => {
    try { 
        const memberOne = await db.member.findUnique({ where: { id: memberOneId } });
        const memberTwo = await db.member.findUnique({ where: { id: memberTwoId } });

        if(memberTwo){
            console.log("Member 2 found");
        }

        if (!memberOne) {
            throw new Error("member one not found");
        }
        if (!memberTwo) {
            throw new Error("member two not found");
        }

        return await db.conversation.create({
            data: {
                memberOneId: memberOneId,
                memberTwoId: memberTwoId
            },
            include: {
                memberOne: {
                    include: {
                        profile: true
                    }
                },
                memberTwo: {
                    include: {
                        profile: true
                    }
                }
            },
        })
    } catch(error) {
        console.log(error);
        return null;
    }
}