{




await
prisma.$disconnect();


});
//
seed.ts
import
{
PrismaClient
}
from
'@prisma/client';
const
prisma
=
new
PrismaClient();
async
function
seed()
{

const
users
=
[

{
name:
'田中
太郎',
email:
'tanaka.taro@example.com'
},

{
name:
'山田
花子',
email:
'yamada.hanako@example.com'
},

{
name:
'佐藤
一郎',
email:
'sato.ichiro@example.com'
},

{
name:
'鈴木
さくら',
email:
'suzuki.sakura@example.com'
},

{
name:
'高橋
健太',
email:
'takahashi.kenta@example.com'
},

{
name:
'伊藤
美咲',
email:
'ito.misaki@example.com'
},

{
name:
'渡辺
大輔',
email:
'watanabe.daisuke@example.com'
},
