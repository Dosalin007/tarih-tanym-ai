const test=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');const path=require('node:path');const {stripTypeScriptTypes}=require('node:module');
const source=stripTypeScriptTypes(fs.readFileSync(path.join(__dirname,'../supabase/functions/accounts/index.ts'),'utf8').replace(/^import .*\n/,''));
async function run(input,{actor={id:'admin',role:'admin',username:'admin',blocked:false,must_change_password:false},token='verified-token',authError=null,target={id:'student',role:'student',username:'pupil.1'},verifyError=null,origin='https://school.test'}={}){
 let handler;const mutations=[];const created=[];const results={};
 const db={auth:{getUser:async()=>({data:{user:{id:actor?.id}},error:authError}),admin:{createUser:async body=>{created.push(body);return {data:{user:{id:'new'}}}},updateUserById:async(id,data)=>{mutations.push({id,data});return{}},deleteUser:async()=>({})}},from:()=>({select:()=>({eq:(key,id)=>({single:async()=>({data:id===actor?.id?actor:target})}),order:()=>({range:async()=>({data:[]})})}),insert:async data=>{mutations.push(data);return{}},update:data=>({eq:async(key,id)=>{mutations.push({id,data});return {}}})})};
 const verifier={auth:{signInWithPassword:async()=>({data:{user:{id:actor?.id}},error:verifyError}),signOut:async()=>({})}};
 vm.runInNewContext(source,{createClient:(url,key)=>key==='anon'?verifier:db,crypto,Response,console,Deno:{env:{get:key=>({SUPABASE_URL:'https://example.test',SUPABASE_SERVICE_ROLE_KEY:'service',SUPABASE_ANON_KEY:'anon',ALLOWED_ORIGINS:'https://school.test'})[key]},serve:fn=>handler=fn}});
 const headers={'content-type':'application/json'};if(token)headers.authorization='Bearer '+token;if(origin)headers.origin=origin;
 const response=await handler(new Request('https://example.test/functions/v1/accounts',{method:'POST',headers,body:JSON.stringify(input)}));return{status:response.status,body:await response.json(),mutations,created};
}
test('unauthenticated and invalid tokens cannot call account administration',async()=>{
 for(const options of[{token:null},{authError:{message:'invalid'}}]){const r=await run({action:'create'},options);assert.equal(r.status,401);assert.equal(r.created.length,0)}
});
test('student, blocked admin, and admin with temporary password cannot create accounts',async()=>{
 for(const actor of[{id:'s',role:'student'},{id:'a',role:'admin',blocked:true},{id:'a',role:'admin',must_change_password:true}]){const r=await run({action:'create'},{actor});assert.equal(r.status,403);assert.equal(r.created.length,0)}
});
test('admin creates a student with random password and mandatory password change',async()=>{
 const input={action:'create',username:'Pupil.01',name:'Ученик',role:'student',grade:10};const a=await run(input),b=await run(input);
 assert.equal(a.status,201);assert.match(a.body.password,/^Tt9![a-f0-9]{32}$/);assert.notEqual(a.body.password,b.body.password);
 assert.equal(a.created[0].email,'pupil.01@accounts.tarih.invalid');assert.equal(a.mutations[0].must_change_password,true);assert.equal('password' in a.mutations[0],false);
});
test('cannot create admin or invalid grades, even with a forged request',async()=>{
 for(const input of[{role:'admin',grade:null},{role:'student',grade:4},{role:'student',grade:'10'}]){const r=await run({action:'create',username:'pupil',name:'Pupil',...input});assert.equal(r.status,400);assert.equal(r.created.length,0)}
});
test('cannot modify an administrator',async()=>{const r=await run({action:'block',id:'other',blocked:true},{target:{id:'other',role:'admin'}});assert.equal(r.status,403);assert.equal(r.mutations.length,0)});
test('password change requires current password and cannot choose the same one',async()=>{
 const input={action:'change_password',password:'NewPassword123!',currentPassword:'OldPassword123!'};
 const r=await run(input,{verifyError:{message:'invalid'}});assert.equal(r.status,403);assert.equal(r.mutations.length,0);
 const same=await run({...input,password:input.currentPassword});assert.equal(same.status,400);
 const good=await run(input);assert.equal(good.status,200);assert.equal(good.mutations[1].data.must_change_password,false);
});
test('origin restriction rejects unexpected browser origin',async()=>{assert.equal((await run({action:'list'},{origin:'https://unexpected.test'})).status,403)});
