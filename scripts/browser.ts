import {existsSync} from 'node:fs';
export function chromiumExecutable(){if(process.env.CHROME_EXECUTABLE)return process.env.CHROME_EXECUTABLE;const windows='C:/Program Files/Google/Chrome/Application/chrome.exe';return process.platform==='win32'&&existsSync(windows)?windows:undefined;}
