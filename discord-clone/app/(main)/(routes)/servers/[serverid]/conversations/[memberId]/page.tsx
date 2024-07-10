import { ChatHeader } from "@/components/chat/chat-header";
import { getOrCreateConversation } from "@/lib/conversation";
import { CurrentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface MemberIdPageProps {
    params: {
        memberId: string,
        serverId: string
    }
}

const MemberIdPage = async ({
    params
} : MemberIdPageProps) => {
    const profile = await CurrentProfile();

    if(!profile){
        return redirectToSignIn()
    }
    
    const currentMember = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            profileId: profile.id
        },
        include: {
            profile: true
        }
    })

    // console.log(currentMember);
    if(!currentMember){
        return redirect("/") 
    }

    const conversation = await getOrCreateConversation(currentMember.id, params.memberId)

    if(!conversation){
        return redirect(`/servers/${params.serverId}`)
    }

    const { memberOne, memberTwo } = conversation

    const otherMember = memberOne.profileId !== profile.id ? memberOne : memberTwo
    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader
                serverId={params.serverId}
                imageUrl={otherMember.profile.imageUrl}
                name={otherMember.profile.name}
                type="conversation"
            />
        </div>
    )
}

export default MemberIdPage