// The obsolete shared-PIN suite has been retired. Run the current full-browser gate.
import {spawnSync} from 'node:child_process';
const result=spawnSync('python',['tests/audit-browser.py'],{stdio:'inherit'});
process.exit(result.status??1);
