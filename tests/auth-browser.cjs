// Run: NODE_PATH=<directory containing playwright> node tests/auth-browser.cjs
// Browser tests use a fake Supabase service. They do not prove remote RLS/OAuth configuration.
const {chromium}=require('playwright');
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});const page=await browser.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.hostname==='cdn.jsdelivr.net')return route.fulfill({contentType:'application/javascript',body:`
  window.testProfile={id:'student-id',username:'student.01',name:'Ученик',role:'student',grade:10,blocked:false,must_change_password:true};window.testSignedIn=false;
  window.supabase={createClient:()=>({auth:{
   signInWithPassword:async creds=>{window.testCredentials=creds;window.testSignedIn=true;return {data:{},error:null}},
   getUser:async()=>({data:{user:window.testSignedIn?{id:window.testProfile.id}:null}}),
   signOut:async()=>{window.testSignedIn=false;return{}},onAuthStateChange:()=>({})},
   from:()=>({select:()=>({eq:()=>({single:async()=>({data:{...window.testProfile},error:null})})})}),
   functions:{invoke:async(name,{body})=>{window.testRequest=body;if(body.action==='change_password')window.testProfile.must_change_password=false;return{data:body.action==='list'?{data:[window.testProfile]}:{ok:true}}}}
  )};`});
  if(url.pathname==='/config.js')return route.fulfill({contentType:'application/javascript',body:"window.TARIH_CONFIG={supabaseUrl:'https://example.supabase.co',supabaseAnonKey:'test-public'}"});
  const file=path.join(__dirname,'..',url.pathname==='/'?'index.html':url.pathname.slice(1));
  if(!fs.existsSync(file))return route.fulfill({status:404,body:''});
  return route.fulfill({contentType:file.endsWith('.js')?'application/javascript':'text/html',body:fs.readFileSync(file)});
 });
 await page.goto('https://tarih.test/');
 await page.getByRole('button',{name:'ҚАЗ',exact:true}).first().click();
 assert.equal(await page.locator('html').getAttribute('lang'),'kk');
 await page.getByRole('button',{name:'RU',exact:true}).first().click();
 await page.evaluate(()=>openLogin());await page.locator('#loginName').fill('Student.01');await page.locator('#loginPassword').fill('TemporaryPassword123!');await page.locator('#loginSubmit').click();
 await page.locator('#passwordModal.on').waitFor();assert.equal(await page.locator('#app').isVisible(),false);
 assert.equal(await page.evaluate(()=>window.testCredentials.email),'student.01@accounts.tarih.invalid');
 await page.locator('#currentPassword').fill('TemporaryPassword123!');await page.locator('#newPassword').fill('NewPassword12345!');await page.locator('#confirmPassword').fill('NewPassword12345!');await page.locator('#passwordSubmit').click();await page.locator('#app.on').waitFor();
 assert.equal(await page.locator('#roleBadge').innerText(),'Ученик • 10');
 await page.evaluate(()=>{localStorage.setItem('tt_role','admin');page('adminusers')});
 assert.equal(await page.locator('[data-page="adminusers"]').isVisible(),false);
 await page.evaluate(()=>{window.testProfile.blocked=true;return refreshProfile()});
 assert.equal(await page.locator('#app').isVisible(),false);
 await page.evaluate(()=>{window.testProfile={id:'admin-id',username:'admin',name:'Учитель',role:'admin',grade:null,blocked:false,must_change_password:false};window.testSignedIn=true;return refreshProfile()});await page.locator('#app.on').waitFor();
 await page.evaluate(()=>renderAdminUsers());
 assert.equal(await page.locator('#adminUsersBody tr').count(),1);
 await page.evaluate(()=>logout());assert.equal(await page.locator('#adminUsersBody tr').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS: RU/KZ, login alias, forced password change, local role tampering, blocking, admin list, logout cleanup.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
