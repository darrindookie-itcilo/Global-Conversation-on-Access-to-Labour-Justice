import type {Metadata,Viewport} from 'next';
import './globals.css';
const origin='https://global-conversation-labour-justice.darrin-dookie.chatgpt.site';
export const viewport:Viewport={width:'device-width',initialScale:1};
export const metadata:Metadata={metadataBase:new URL(origin),title:'Global Conversation on Access to Labour Justice',description:'Diverse practices, shared goals. Programme, workshop games, resources and your notebook. Turin, 23–27 November 2026.',alternates:{canonical:origin},openGraph:{type:'website',url:origin,title:'Global Conversation on Access to Labour Justice',description:'Your ITCILO learning companion · Turin, 23–27 November 2026',siteName:'Global Conversation · ITCILO',images:[{url:'/social-preview.jpg',width:1600,height:837,alt:'Global Conversation on Access to Labour Justice · ITCILO'}]},twitter:{card:'summary_large_image',title:'Global Conversation on Access to Labour Justice',description:'Diverse practices, shared goals · Turin, 23–27 November 2026',images:['/social-preview.jpg']},icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
