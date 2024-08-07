import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { getOrCreateConversation } from "@/lib/conversation";
import { CurrentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface MemberIdPageProps {
    params: {
        memberId: string,
        serverid: string
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
            serverId: params.serverid,
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
        return redirect(`/servers/${params.serverid}`)
    }

    const { memberOne, memberTwo } = conversation

    const otherMember = memberOne.profileId !== profile.id ? memberOne : memberTwo
    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader
                serverId={params.serverid}
                imageUrl={otherMember.profile.imageUrl}
                name={otherMember.profile.name}
                type="conversation"
            />
            <ChatMessages 
                member={currentMember}
                name={otherMember.profile.name}
                chatId={conversation.id}
                type="conversation"
                apiUrl="/api/direct-messages"
                paramKey="conversationId"
                paramValue={conversation.id}
                socketUrl="/api/socket/direct-messages"
                socketQuery={{
                    conversationId: conversation.id
                }}
            />
            <ChatInput 
                name={otherMember.profile.name}
                type="conversation"
                apiUrl="/api/socket/direct-messages"
                query={{
                    conversationId: conversation.id
                }}
            />
        </div>
    )
}

export default MemberIdPage
