 "use client";
 import { useEffect } from "react";

 export default function InstallBootstrap(){
 // required to render bootstrap in next
  useEffect(() => {
    //@ts-ignore
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);
  return <></>
}