'use client';
import Image from "next/image";
import useState  from "react-usestateref";
import  me from '../../public/me.png'
import bot from '../../public/bot.jpg'
import send from '../../public/send.png'
import notSend from '../../public/notSend.png'

enum Creator{
  me = 0,
  bot = 1
}

//Types
interface MessageProps {
  text: string;
  from: Creator;
  key: number;
}

// Interface
 interface InputProps {
  onSend: (input: string) => void;
  disabled: boolean;
 }
 const ChatMessage = ({ text, from}: MessageProps) =>{
  return (
    <>
    {from == Creator.me && (
      <div className="bg-white p-4 rounded-lg flex gap-4 whitespace-pre-wrap ">
      <Image src={me} alt="User" width={40} />
      <p className="text-gray-700">{ text }</p>
      </div>
    ) }
    {from == Creator.bot && (
     <div className="bg-gray-100 p-4 rounded-lg flex gap-4 whitespace-pre-wrap">
      <Image src={bot} alt="AI" width={40}/>
      <p className="text-gray-700" >{ text }</p>
     </div> 
    )}
    </>
  );
 };




 const ChatInput = ({ onSend, disabled }: InputProps ) => {
  const [input,setInput] = useState('')

  const sendInput = () => {
    onSend(input);
    setInput('');
  };
   
  const handleKeyDown = (event: any) => {
    if(event.keyCode === 13){
      sendInput();
    }
  };

  return (
   <div className="bg-white border-2 p-2 rounded-lg flex justify-center" >
    <input
      value={input}
      onChange={(ev : any) => setInput(ev.target.value)}
      className="w-full py-2 px-3 text-gray-800 rounded-lg focus:outline-none"
      type="text"
      placeholder="Write Prompt here"
      disabled={disabled}
      onKeyDown={(ev) => handleKeyDown(ev)}
    />
    { disabled && (
     <Image src={send} alt="send" className="w-6 h-6" />
    )}
    {!disabled && (
      <button 
      onClick={() => sendInput()}
      className ="p-2 rounded-md text-gray-500 bottom-1.5 right-1"
      >
      <Image src={send} alt="send" className="w-6 h-6"/>
      </button>
    )}
   </div>
  );
 };

 //page
export default function Home(){
  const [messages, setMessages, messagesRef] = useState<MessageProps[]>([]);
  const [loading, setLoading] = useState(false);

  const callApi = async (input: string) => {
    setLoading(true);

    const myMessage: MessageProps = {
      text: input,
      from: Creator.me,
      key: new Date().getTime()
    };

    setMessages([...messagesRef.current, myMessage]);
    const response = await fetch('/api/generate-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: input
      })
    }).then((response) => response.json());
    setLoading(false);

    if (response.text) {
      const botMessage: MessageProps = {
        text: response.text,
        from: Creator.bot,
        key: new Date().getTime()
      };
      setMessages([...messagesRef.current, botMessage]);
    }
    else{
      // Show error
    }
  };
  
    return (
     <main className="relative max-w-2xl mx-auto">
       <div className="sticky top-8 w-full pt-10 px-4">
         <ChatInput onSend={(input) => callApi(input)} disabled={loading} />
       </div>

       <div className="mt-10 px-4">
         {messages.map((msg: MessageProps) => (
          <ChatMessage key={msg.key} text={msg.text} from={msg.from} />
         ))}
         {messages.length == 0 && <p className="text-center text-gray-400">Super GPT</p>}
       </div>
     </main>
    );
        }