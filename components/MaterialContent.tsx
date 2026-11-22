import { Fragment } from "react";
import { MathText } from "@/components/MathText";

/** Mirrors the safe line-based renderer used by materi.php without injecting HTML. */
export function MaterialContent({ content }: { content:string }) {
  const blocks: Array<{ type:"heading"|"paragraph"|"math"|"list"; value:string|string[] }> = [];
  const lines=content.split(/\r?\n/); let list:string[]=[]; let math:string[]=[];
  const flushList=()=>{if(list.length){blocks.push({type:"list",value:list});list=[];}};
  const flushMath=()=>{if(math.length){blocks.push({type:"math",value:math.join("\n")});math=[];}};
  for(const raw of lines){const line=raw.trim();if(math.length){math.push(line);if(line.endsWith("\\]"))flushMath();continue;}if(!line){flushList();continue;}if(line.startsWith("### ")){flushList();blocks.push({type:"heading",value:line.slice(4)});continue;}if(line.startsWith("- ")){list.push(line.slice(2));continue;}flushList();if(line.startsWith("\\[")&&!line.endsWith("\\]")){math.push(line);continue;}if(line.startsWith("\\[")||line.endsWith("\\]"))blocks.push({type:"math",value:line});else blocks.push({type:"paragraph",value:line});}
  flushList();flushMath();
  return <>{blocks.map((block,index)=><Fragment key={index}>{block.type==="heading"?<h4>{block.value as string}</h4>:block.type==="list"?<ul>{(block.value as string[]).map((item,itemIndex)=><li key={itemIndex}><MathText>{item}</MathText></li>)}</ul>:block.type==="math"?<div className="math-display"><MathText>{block.value as string}</MathText></div>:<p><MathText>{block.value as string}</MathText></p>}</Fragment>)}</>;
}
