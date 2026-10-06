// Accounts use an internal email alias; learners only enter a username.
// The .invalid domain intentionally has no mailbox. Password reset is admin-managed.
const cfg=window.TARIH_CONFIG||{};
const sb=cfg.supabaseUrl&&cfg.supabaseAnonKey&&window.supabase
  ?window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey):null;
let currentProfile=null;
let profileTimer=null;
let authGeneration=0;
const USERNAME=/^[a-z0-9_.-]{3,32}$/;
function closeAuth(){document.getElementById('modal').classList.remove('on')}
function openLogin(){document.getElementById('modal').classList.add('on');document.getElementById('authError').textContent='';document.getElementById('loginName').focus()}
function clearCredentials(){document.getElementById('issuedText').textContent='';document.getElementById('issuedCredentials').hidden=true}
function clearSessionUI(){
  authGeneration++;currentProfile=null;currentPackage=null;currentEntTopic=null;clearInterval(profileTimer);profileTimer=null;
  document.getElementById('app').classList.remove('on');document.getElementById('landing').classList.remove('off');
  document.getElementById('passwordModal').classList.remove('on');clearCredentials();
  document.getElementById('adminUsersBody').replaceChildren();
  document.getElementById('loginPassword').value='';document.getElementById('currentPassword').value='';document.getElementById('newPassword').value='';document.getElementById('confirmPassword').value='';
  document.getElementById('classList').replaceChildren();document.getElementById('result').style.display='none';
  document.getElementById('entChat').replaceChildren();document.getElementById('entQuizBox').replaceChildren();
  document.getElementById('entQuizResult').replaceChildren();document.getElementById('entLessonPanel').style.display='none';document.getElementById('entQuizPanel').style.display='none';
}
async function loginWithPassword(){
  const out=document.getElementById('authError'),button=document.getElementById('loginSubmit');out.textContent='';
  const username=document.getElementById('loginName').value.trim().toLowerCase();
  if(!sb){out.textContent='Вход ещё не настроен. Обратитесь к администратору сайта.';return}
  if(!USERNAME.test(username)){out.textContent='Логин: 3–32 латинские буквы, цифры, точки, дефисы или подчёркивания.';return}
  button.disabled=true;
  try{
    const {error}=await sb.auth.signInWithPassword({email:username+'@accounts.tarih.invalid',password:document.getElementById('loginPassword').value});
    document.getElementById('loginPassword').value='';
    if(error)throw new Error('Не удалось войти. Проверьте логин и пароль или обратитесь к учителю.');
    await refreshProfile();
  }catch(e){out.textContent=e.message||'Не удалось войти.'}
  finally{button.disabled=false}
}
async function refreshProfile(){
  if(!sb)return;
  const generation=++authGeneration;
  const {data:auth,error:authError}=await sb.auth.getUser();
  if(generation!==authGeneration)return;
  if(authError||!auth.user){clearSessionUI();return}
  const {data:p,error}=await sb.from('profiles').select('id,username,name,role,grade,blocked,must_change_password').eq('id',auth.user.id).single();
  if(generation!==authGeneration)return;
  if(error||!p||p.blocked){await logout();openLogin();document.getElementById('authError').textContent='Доступ не разрешён. Обратитесь к учителю.';return}
  const changed=!currentProfile||currentProfile.id!==p.id||currentProfile.role!==p.role||currentProfile.grade!==p.grade||currentProfile.must_change_password!==p.must_change_password;
  currentProfile=p;closeAuth();
  if(p.must_change_password){document.getElementById('app').classList.remove('on');document.getElementById('passwordModal').classList.add('on')}
  else{
    document.getElementById('passwordModal').classList.remove('on');document.getElementById('landing').classList.add('off');document.getElementById('app').classList.add('on');
    updateWelcome(p.name,p.role,p.grade);if(changed)buildMenu(p.role,p.grade);
  }
  if(!profileTimer)profileTimer=setInterval(()=>refreshProfile().catch(()=>clearSessionUI()),30000);
}
function updateWelcome(name,role,grade){
  const kz=currentLang()==='kz';document.getElementById('welcome').textContent=(kz?'Қош келдіңіз, ':'Добро пожаловать, ')+name;
  document.getElementById('roleBadge').textContent=({admin:kz?'Әкімші':'Администратор',teacher:kz?'Мұғалім':'Учитель',student:kz?'Оқушы':'Ученик'})[role]+(role==='student'?' • '+grade:'');
}
async function logout(){clearSessionUI();if(sb){try{await sb.auth.signOut({scope:'local'})}catch{}}}
async function accountRequest(body){
  if(!sb)throw new Error('Вход не настроен.');
  const {data,error}=await sb.functions.invoke('accounts',{body});
  if(error||data?.error)throw new Error(data?.error||'Операция не выполнена. Проверьте подключение и права администратора.');
  return data;
}
async function changeOwnPassword(){
  const password=document.getElementById('newPassword').value,out=document.getElementById('passwordError'),button=document.getElementById('passwordSubmit');out.textContent='';
  if(password!==document.getElementById('confirmPassword').value){out.textContent='Пароли не совпадают.';return}
  if(password.length<12||password.length>128){out.textContent='Пароль должен содержать от 12 до 128 символов.';return}
  button.disabled=true;
  try{await accountRequest({action:'change_password',password,currentPassword:document.getElementById('currentPassword').value});document.getElementById('currentPassword').value='';document.getElementById('newPassword').value='';document.getElementById('confirmPassword').value='';await refreshProfile()}
  catch(e){out.textContent=e.message}finally{button.disabled=false}
}
function isAdmin(){return currentProfile?.role==='admin'&&!currentProfile.blocked&&!currentProfile.must_change_password}
async function loadAdminProfiles(){
  if(!isAdmin())return[];
  const {data,error}=await accountRequest({action:'list'});if(error)throw new Error(error);return data||[];
}
async function renderAdminDashboard(){
  if(!isAdmin())return;
  try{const users=await loadAdminProfiles();if(!isAdmin())return;
    for(const [id,count]of Object.entries({adminUsersCount:users.length,adminTeachersCount:users.filter(p=>p.role==='teacher').length,adminStudentsCount:users.filter(p=>p.role==='student').length,adminEntCount:users.filter(p=>p.role==='student'&&[10,11].includes(p.grade)).length}))document.getElementById(id).textContent=count;
  }catch(e){document.getElementById('accountError').textContent=e.message}
}
let userRenderVersion=0;
async function renderAdminUsers(){
  if(!isAdmin())return;
  const version=++userRenderVersion;
  try{
    const users=await loadAdminProfiles();if(!isAdmin()||version!==userRenderVersion)return;
    const q=document.getElementById('adminSearch').value.toLowerCase(),filter=document.getElementById('adminFilter').value,body=document.getElementById('adminUsersBody');body.replaceChildren();
    users.filter(u=>(u.name+' '+u.username).toLowerCase().includes(q)&&(filter==='all'||(filter==='blocked'?u.blocked:u.role===filter))).forEach(u=>{
      const tr=document.createElement('tr');
      for(const value of[u.name,u.username,u.role,u.grade||'—',u.blocked?'Заблокирован':'Активен']){const td=document.createElement('td');td.textContent=value;tr.append(td)}
      const td=document.createElement('td');
      if(u.role!=='admin')for(const[label,handler]of[['Роль/класс',()=>adminChangeRole(u)],['Новый пароль',()=>adminResetPassword(u)],[u.blocked?'Разблокировать':'Блокировать',()=>adminToggleBlock(u)]]){const b=document.createElement('button');b.className='btn alt';b.textContent=label;b.onclick=handler;td.append(b)}
      tr.append(td);body.append(tr);
    });
  }catch(e){document.getElementById('accountError').textContent=e.message}
}
function showCredentials(data){document.getElementById('issuedText').textContent='Логин: '+data.username+'\nВременный пароль: '+data.password+'\nПередайте лично ученику. При первом входе он сменит пароль.';document.getElementById('issuedCredentials').hidden=false}
async function adminCreateAccount(){
  if(!isAdmin())return;
  const button=document.getElementById('createAccountSubmit');button.disabled=true;clearCredentials();document.getElementById('accountError').textContent='';
  try{const result=await accountRequest({action:'create',username:document.getElementById('accountUsername').value.trim().toLowerCase(),name:document.getElementById('accountName').value.trim(),role:document.getElementById('accountRole').value,grade:Number(document.getElementById('accountGrade').value)});showCredentials(result);await renderAdminUsers();await renderAdminDashboard()}
  catch(e){document.getElementById('accountError').textContent=e.message}finally{button.disabled=false}
}
async function adminChangeRole(u){
  if(!isAdmin())return;
  const role=prompt('Роль: teacher / student',u.role);if(!['teacher','student'].includes(role))return;
  const grade=role==='student'?Number(prompt('Класс: 5–11',u.grade||10)):null;if(role==='student'&&![5,6,7,8,9,10,11].includes(grade))return;
  try{await accountRequest({action:'update',id:u.id,role,grade});await renderAdminUsers();await renderAdminDashboard()}catch(e){alert(e.message)}
}
async function adminToggleBlock(u){if(!isAdmin())return;try{await accountRequest({action:'block',id:u.id,blocked:!u.blocked});await renderAdminUsers()}catch(e){alert(e.message)}}
async function adminResetPassword(u){if(!isAdmin()||!confirm('Выдать новый пароль для '+u.username+'? Старый пароль перестанет работать.'))return;clearCredentials();try{showCredentials(await accountRequest({action:'reset_password',id:u.id}));}catch(e){alert(e.message)}}
function initializeAuth(){
  // Remove obsolete demo profiles and plaintext demo credentials, never migrate their privileges.
  for(const k of Object.keys(localStorage))if(k==='tt_users'||k.startsWith('tt_google_')||['tt_role','tt_name','tt_student_grade','tt_session_email'].includes(k))localStorage.removeItem(k);
  if(!sb)return;
  sb.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT')clearSessionUI()});
  refreshProfile().catch(()=>clearSessionUI());
}
