/* ============================================================
   APP.JS - all the behaviour of the Music Therapy page.
   ------------------------------------------------------------
   SECTIONS (same numbers as styles.css)
   1. Song data + saved settings
   2. Small helpers
   3. Fallback tone (Web Audio)
   4. Playback engine
   5. Rendering: now-playing, lyrics, song grid
   6. The clock (progress bar + lyric highlight)
   7. Controls + keyboard shortcuts
   8. Views, mood filter, search
   9. Accounts, Premium, checkout, profile
   10. Start-up
   ------------------------------------------------------------
   Nothing comes from a server: songs, the "account" and the
   subscription all live in this file + localStorage.
   ============================================================ */

/* ============ 1. SONG DATA - EDIT YOUR SONGS HERE ============
   cover : the card image (files in assets/covers/)
   hue   : 0-360, re-tints the whole page while that song plays
src    : put your own mp3 files in a "songs" folder (songs/01.mp3 ...). If a file is missing,
the app plays a soft built-in healing tone so everything still works.
lyrics : paste your lyrics inside backticks:  lyrics:`line 1
line 2` (labels like [Chorus] are removed for you), or use an array of lines. Plain strings are spread evenly across the song.
For exact sync use [seconds, "line"], e.g. [12.5, "first line"], or start a line with [mm:ss] inside the backticks.
Long gaps between timed lines are filled in with [Instrumental] automatically.
*/
const COVER_AKO = "assets/covers/ako-ang-bagyo.jpg"; // album cover for song 1 (embedded)
const COVER_BULONG = "assets/covers/bulong.jpg";
const COVER_LET = "assets/covers/let-me-be-the-one.jpg";
const COVER_GOD = "assets/covers/goodness-of-god.jpg";
const COVER_JANICE = "assets/covers/janice.jpg";
const COVER_KISAME = "assets/covers/kisame.jpg";
const COVER_NPB = "assets/covers/na-para-bang.jpg";
const COVER_TADHANA = "assets/covers/tadhana.jpg";
const COVER_TENCHU = "assets/covers/tenchu.jpg";
const COVER_WHO = "assets/covers/who-am-i.jpg";
const SONGS = [
 {title:"ako ang bagyo", artist:"Shean", cover:COVER_AKO, hue:215, mood:"heartbreak", src:"songs/01.mp3",
  lyrics:[
   [14.28,"Ah-ah"],
   [17.09,"Ah-ah"],
   [19.81,"Ah-ah"],
   [25.93,"Pinaikutan mo 'ko, sumunod mundo ko, nahilo"],
   [31.67,"Hindi ko inakalang lalaki"],
   [37.36,"Bumigat ang kalungkutan, mga luha 'di napigilan"],
   [43.16,"Hanggang ngayo'y bumubuhos pa rin"],
   [50.31,"Matakot na kayo"],
   [55.24,"Ako, ako ang bagyo"],
   [59.62,"Kulimlim ng langit sa inyong dalawa"],
   [65.47,"Bulong ko sa hangin, \"Sana 'di kayo masaya\""],
   [71.01,"Sa tibay ng bahay na titirhan niyo"],
   [76.85,"Tatangayin ko bawat yero"],
   [81.98,"Dahil ako, ako ang bagyo"],
   [91.53,"Itinago na litrato, kunwaring 'di ko nakita"],
   [97.39,"Takot ka sigurong masalanta ko siya?"],
   [103.05,"Tingin mo ba 'di ko kaya? Gusto mo na gusto kita"],
   [108.66,"Tinatali mo 'ko sa pag-asa"],
   [116.11,"Matakot na kayo"],
   [120.88,"Ako, ako, ako ang bagyo"],
   [125.37,"Kulimlim ng langit sa inyong dalawa"],
   [131.09,"Bulong ko sa hangin, \"Sana 'di kayo masaya\""],
   [136.61,"Sa tibay ng bahay na titirhan niyo"],
   [142.6,"Tatangayin ko bawat yero"],
   [148.22,"Dilim ng paligid, buhos ng emosyon"],
   [154.09,"Tunog ng pag-ibig sa sama ng panahon"],
   [159.66,"Sa tibay ng bahay na titirhan niyo"],
   [165.52,"Gigibain ko mga pader niyo"],
   [170.53,"Dahil ako, ako ang bagyo, ooh, ooh"],
   [185.35,"Lahat ng hahawakan ko, lagi sa 'kin na lumalayo"],
   [190.4,"Lahat ng tao na nariyan, sa tuwing lalapit ay nasasaktan"],
   [196.51,"At 'pag nag-sawa na sila sa akin, 'pag wala na sa 'kin na nakatingin"],
   [203.04,"'Pag hindi na 'ko nakakatawa, ako 'yong lagi na naiiwan mag-isa"],
   [207.8,"Kahit pa na subukan ko ang lahat ng makakaya ko"],
   [211.14,"Hindi pa rin naman 'yon sapat, kung iisipin mo"],
   [213.92,"Walang lalapit kung puro lang sugat ang matatamo nila"],
   [219.17,"At sa tagal ko na binitbit ang bigat nitong pag-ibig ko"],
   [222.51,"Kunting galaw mo lang ay kidlat na 'gad sa dibdib ko"],
   [225.33,"'Di ko naman gusto na saktan kita, kaya mag-ingat ka"],
   [230.52,"Ako ang kulimlim ng langit sa inyong dalawa"],
   [239.63,"Bulong ko sa hangin, \"Sana 'di kayo masaya\""],
   [245.21,"Sa tibay ng bahay na titirhan niyo"],
   [251.24,"Tatangayin ko bawat yero"],
   [256.99,"Kahit na matunaw ako"],
   [261.9,"Dahil ako, ako ang bagyo"]
  ]},
 {title:"let me be the one", artist:"Jimmy Bondoc & Julie Anne San Jose", cover:COVER_LET, hue:330, mood:"heartbreak", src:"songs/02.mp3",
  lyrics:[
   [44.18,"Somebody told me you were leavin', I didn't know"],
   [52.54,"Somebody told me you're unhappy"],
   [55.76,"But it doesn't show"],
   [60.95,"Somebody told me that you don't want me no more, no"],
   [70.09,"So you're walkin' out the door"],
   [72.92,"Nobody told me you've been cryin' every night"],
   [80.96,"Nobody told me you'd been dyin'"],
   [83.87,"But didn't want to fight"],
   [88.85,"Nobody told me that you fell out of love from me"],
   [94.06,"So I'm settin' you free"],
   [102.2,"Let me be the one to break it up"],
   [105.77,"So you won't have to make excuses"],
   [109.93,"We don't need to find a set up where"],
   [113.6,"Someone wins and someone loses"],
   [117.77,"We just have to say our love was true"],
   [121.25,"But has now become a lie"],
   [125.12,"So I'm tellin' you I love you one last time"],
   [132.3,"And goodbye"],
   [145.75,"Somebody told me you still loved me"],
   [148.72,"I don't know why"],
   [153.57,"Nobody told me that you only needed time to fly"],
   [161.01,"Somebody told me that you want to come back when"],
   [166.26,"Our love is real again"],
   [172.09,"Let me be the one to break it up"],
   [175.59,"So you won't have to make excuses"],
   [179.37,"We don't need to find a set up where"],
   [183.01,"Someone wins and someone loses"],
   [186.94,"We just have to say our love was true"],
   [190.42,"But has now become a lie"],
   [194.01,"So I'm tellin' you I love you one last time"],
   [200.88,"And goodbye"],
   [203.91,"Just turn around and walk away"],
   [207.35,"You don't have to live like this, no, no"],
   [212.75,"But if you love me still then stay"],
   [216.45,"Don't keep me waiting for that final kiss"],
   [220.16,"We can work together through this test"],
   [223.68,"Or we can work through it apart"],
   [227.42,"I just need to get this off my chest"],
   [231.12,"That you will always have my heart"],
   [236.33,"Let me be the one"],
   [240.98,"Let me be the one to break it up"],
   [244.74,"So you won't have to make excuses"],
   [248.9,"We don't need to find a set up where"],
   [252.82,"Someone wins and someone loses"],
   [257.03,"We just have to say our love was true"],
   [260.98,"But has now become a lie"],
   [267.07,"So I'm tellin' you I love you one last time"],
   [274.65,"And goodbye"],
   [284.69,"Let me be the one"]
  ]},
 {title:"bulong", artist:"December Avenue", cover:COVER_BULONG, hue:265, mood:"heartbreak", src:"songs/03.mp3",
  lyrics:[
   [37.22,"Hindi masabi ang nararamdaman"],
   [44.38,"Hindi makalapit, sadyang nanginginig na lang"],
   [51.75,"Mga kamay na sabik sa piling mo"],
   [57.92,"Ang iyong matang walang mintis"],
   [61.41,"Sa pagtigil ng aking mundo"],
   [65.52,"Ako'y alipin ng pag-ibig mo"],
   [72.69,"Handang ibigin ang 'sang tulad mo"],
   [79.67,"Hangga't ang puso mo'y sa akin lang"],
   [84.35,"Hindi ka na malilinlang"],
   [87.84,"Ikaw ang ilaw sa dilim"],
   [91.11,"At ang liwanag ng mga bituin"],
   [108.05,"Hindi mapakali, hanggang tingin na lang"],
   [115.3,"Bumubulong sa 'yong tabi"],
   [119.28,"Sadyang walang makapantay"],
   [122.96,"Sa kagandahang inuukit mo sa isip ko"],
   [130.08,"Ako'y alipin ng pag-ibig mo"],
   [136.94,"Handang ibigin ang 'sang tulad mo"],
   [144.18,"Hangga't ang puso mo'y sa akin lang"],
   [148.62,"Hindi ka na malilinlang"],
   [152.35,"Ikaw ang ilaw sa dilim"],
   [155.76,"At ang liwanag ng mga bituin"],
   [173.91,"Oh-ooh-whoa-ooh-whoa-ooh-whoa-ooh-whoa"],
   [180.95,"Oh-ooh-whoa-ooh-whoa-ooh-whoa-ooh-whoa"],
   [186.95,"Ako'y alipin ng pag-ibig mo"],
   [194.43,"Handang ibigin ang 'sang tulad mo"],
   [201.18,"Hangga't ang puso mo'y sa akin lang"],
   [205.84,"Hindi ka na malilinlang"],
   [209.49,"Ikaw ang ilaw sa dilim"],
   [212.72,"At ang liwanag ng mga bituin"],
   [221.98,"Ng mga bituin"]
  ]},
 {title:"who am i", artist:"Casting Crowns", cover:COVER_WHO, hue:30, mood:"faith", src:"songs/04.mp3",
  lyrics:[
   [17.68,"Who am I, that the Lord of all the earth would care to know my name?"],
   [26.72,"Would care to feel my hurt?"],
   [31.92,"Who am I, that the bright and morning star would choose to light the way"],
   [40.85,"For my ever wandering heart?"],
   [46.26,"Not because of who I am"],
   [49.77,"But because of what You've done"],
   [53.39,"Not because of what I've done"],
   [57.08,"But because of who You are"],
   [61.62,"I am a flower quickly fading"],
   [66.12,"Here today and gone tomorrow"],
   [69.78,"A wave tossed in the ocean (ocean)"],
   [73.48,"A vapor in the wind"],
   [75.8,"Still You hear me when I'm calling"],
   [80.2,"Lord, You catch me when I'm falling"],
   [83.86,"And You've told me who I am"],
   [89.03,"I am yours, I am yours"],
   [103.56,"Who am I, that the eyes that see my sin would look on me with love"],
   [112.63,"And watch me rise again"],
   [117.85,"Who am I, that the voice that calmed the sea would call out through the rain"],
   [127.06,"And calm the storm in me?"],
   [132.19,"Not because of who I am"],
   [135.78,"But because of what You've done"],
   [139.47,"Not because of what I've done"],
   [142.97,"But because of who You are"],
   [147.56,"I am a flower quickly fading"],
   [151.92,"Here today and gone tomorrow"],
   [156.12,"A wave tossed in the ocean (ocean)"],
   [159.25,"A vapor in the wind"],
   [161.94,"Still You hear me when I'm calling"],
   [166.28,"Lord, You catch me when I'm falling"],
   [169.85,"And You've told me who I am (I am)"],
   [174.99,"I am yours"],
   [195.32,"Not because of who I am"],
   [198.98,"But because of what You've done"],
   [202.43,"Not because of what I've done"],
   [206.08,"But because of who You are"],
   [211.65,"I am a flower quickly fading"],
   [216.03,"Here today and gone tomorrow"],
   [219.77,"A wave tossed in the ocean (ocean)"],
   [223.57,"A vapor in the wind"],
   [225.65,"Still You hear me when I'm calling"],
   [230.26,"Lord, You catch me when I'm falling"],
   [233.86,"And You've told me who I am (I am)"],
   [238.85,"I am yours"],
   [248.06,"I am yours"],
   [251.42,"I am yours"],
   [263.39,"Whom shall I fear?"],
   [265.14,"Whom shall I fear?"],
   [268.75,"'Cause I am yours"],
   [272.94,"I am yours"]
  ]},
 {title:"goodness of god", artist:"CeCe Winans", cover:COVER_GOD, hue:45, mood:"faith", src:"songs/05.mp3",
  lyrics:[
   [20.27,"I love You, Lord"],
   [24.55,"Oh, Your mercy never fails me"],
   [29.39,"All my days, I've been held in Your hands"],
   [36.73,"From the moment that I wake up"],
   [40.97,"Until I lay my head"],
   [44.76,"Oh, I will sing of the goodness of God"],
   [54.25,"And all my life You have been faithful"],
   [62.43,"And all my life You have been so, so good"],
   [69.95,"With every breath that I am able"],
   [75.64,"Oh, I will sing of the goodness of God"],
   [82.9,"I love Your voice"],
   [87.46,"You have led me through the fire"],
   [92.47,"And in darkest night You are close like no other"],
   [100.21,"I've known You as a Father"],
   [104.28,"I've known You as a Friend"],
   [108.15,"And I have lived in the goodness of God, yeah"],
   [117.31,"And all my life You have been faithful, oh-oh-oh"],
   [124.63,"And all my life You have been so, so good"],
   [133.01,"With every breath that I am able"],
   [138.67,"Oh, I will sing of the goodness of God, yeah"],
   [148.29,"'Cause Your goodness is running after, it's running after me"],
   [155.7,"Your goodness is running after, it's running after me"],
   [162.39,"With my life laid down, I'm surrendered now"],
   [166.22,"I give You everything"],
   [170.93,"'Cause Your goodness is running after, it's running after me, oh-oh"],
   [178.88,"'Cause Your goodness is running after, it's running after me"],
   [185.75,"Your goodness is running after, it's running after me"],
   [192.84,"With my life laid down, I'm surrendered now"],
   [197,"I give You everything"],
   [201.29,"'Cause Your goodness is running after, it keeps running after me"],
   [215.12,"And all my life You have been faithful"],
   [221.88,"And all my life You have been so, so good"],
   [230.35,"With every breath that I am able"],
   [235.32,"Oh, I'm gonna sing of the goodness of God"],
   [241.91,"I'm gonna sing, I'm gonna sing"],
   [249.12,"'Cause all my life You have been faithful"],
   [257.09,"And all my life You have been so, so good"],
   [264.67,"With every breath that I am able"],
   [270.25,"Oh, I'm gonna sing of the goodness of God"],
   [277.94,"Oh, I'm gonna sing of the goodness of God"]
  ]},
 {title:"kisame", artist:"Rhodessa", cover:COVER_KISAME, hue:195, mood:"heartbreak", src:"songs/06.mp3",
  lyrics:[
   [10.65,"Gustong tumingin sa iyong mga mata"],
   [20.21,"Na nagniningning kahit nasaan ka pa"],
   [27.24,"Pero bakit ba ang layo mo?"],
   [32.44,"Laging magkabilang mundo"],
   [36.86,"Pero bakit ba ang layo mo?"],
   [41.99,"Puwedeng sa 'yo na lang ako?"],
   [47.28,"Nakatitig sa kisame"],
   [51.81,"Kakaisip kung pa'no sasabihin sa iyo"],
   [58.99,"Na gusto, gustong-gusto kita"],
   [68.17,"Hindi na kita maalis sa isip ko"],
   [77.34,"'Di maikaila na ikaw ang tahanan ko"],
   [84.89,"Pero bakit ba lumalayo?"],
   [89.89,"Palagi na lang ba ganito?"],
   [94.23,"Pero bakit ba ayaw mo?"],
   [99.5,"Puwedeng sa 'yo na lang ako?"],
   [104.86,"Nakatitig sa kisame"],
   [109.69,"Kakaisip kung pa'no sasabihin sa iyo"],
   [116.67,"Na gusto, gustong-gusto kita"],
   [130.79,"Okay lang kahit hindi mo ako pansinin"],
   [137.74,"Kaya ko naman damhin lahat ng sakit"],
   [143.2,"Basta ikaw"],
   [149.91,"Okay lang kahit hindi mo ako pansinin"],
   [157.19,"Kaya ko naman damhin lahat ng sakit"],
   [162.42,"Basta ikaw"],
   [167.12,"Nakatitig sa kisame"],
   [171.9,"Kakaisip kung pa'no sasabihin sa iyo"],
   [179.13,"Na gusto, gustong-gusto kita"],
   [186.25,"Nakatitig sa kisame"],
   [191,"Kakaisip kung pa'no sasabihin sa iyo"],
   [198.22,"Na gusto, gustong-gusto kita"]
  ]},
 {title:"tadhana", artist:"Up Dharma Down", cover:COVER_TADHANA, hue:285, mood:"heartbreak", src:"songs/07.mp3",
  lyrics:[
   [32.19,"Sa hindi inaasahang"],
   [38.14,"Pagtatagpo ng mga mundo"],
   [44.43,"May minsan lang na nagdugtong"],
   [49.57,"Damang-dama na ang ugong nito"],
   [56.89,"'Di pa ba sapat ang sakit at lahat"],
   [62.7,"Na hinding-hindi ko ipararanas sa 'yo?"],
   [69.22,"Ibinubunyag ka ng iyong matang"],
   [74.02,"Sumisigaw ng pagsinta"],
   [78.83,"Ba't 'di papatulan ang pagsuyong nagkulang?"],
   [84.9,"Tayong umaasang hilaga't kanluran"],
   [91.1,"Ikaw ang hantungan, at bilang kanlungan mo"],
   [98.96,"Ako ang sasagip sa 'yo, whoa-oh"],
   [130.66,"Sa'n nga ba patungo? (Saan nga ba patungo?)"],
   [136.75,"Nakayapak at nahihiwagaan"],
   [143.01,"Ang bagyo ng tadhana ay"],
   [148.07,"Dinadala ako sa init ng bisig mo"],
   [152.82,"Ba't 'di pa sabihin ang hindi mo maamin?"],
   [158.83,"Ipauubaya na lang ba 'to sa hangin?"],
   [164.95,"'Wag mong ikatakot ang bulong ng damdamin mo"],
   [172.85,"Naririto ako't nakikinig sa 'yo"],
   [178.41,"Oh-whoa, oh-whoa, oh-whoa, oh"],
   [186.16,"Oh-whoa, oh-whoa, oh-whoa"],
   [191.49,"Oh-whoa, oh-whoa, oh, oh-whoa"],
   [197.73,"Oh-whoa, oh-whoa"]
  ]},
 {title:"janice", artist:"Dilaw", cover:COVER_JANICE, hue:150, mood:"heartbreak", src:"songs/08.mp3",
  lyrics:[
   [32.08,"Halika rito"],
   [38.62,"Sumugal ka ng sampung minuto"],
   [46.26,"Sabay tayong maglalayag sa kawalan"],
   [54.47,"Sakay ng ating isipan"],
   [64.01,"Iwan natin silang lahat"],
   [67.66,"Tayo muna hanggang sa pagdilat"],
   [72.55,"Buburahin lahat ng alaala kasama sila"],
   [80.03,"Saglit lang tayo munang dalawa"],
   [86.58,"Saglit lang tayo munang dalawa"],
   [95.75,"Lumapit ka rito"],
   [102.3,"Kahit na sampung segundo"],
   [110.53,"Hawakan ang aking kamay kahit pasmado"],
   [119.45,"Magsisilbing tulay tungo sa 'di sigurado"],
   [128.09,"Iwan natin silang lahat"],
   [131.15,"Tayo muna hanggang sa pagdilat"],
   [136.33,"Buburahin lahat ng alaala kasama sila"],
   [139.13,"Saglit lang tayo munang dalawa"],
   [146.49,"Saglit lang tayo munang dalawa"],
   [160.26,"At kung sakaling hindi"],
   [173.25,"Umayon ang panahon"],
   [189.48,"Hahayaan ng tadhanang"],
   [191.63,"Gumawa ng paraan"],
   [193.92,"Tatakbo sa kawalan"],
   [199.82,"'Di ka papakawalan"],
   [206.54,"Saglit lang tayo munang dalawa"]
  ]},
 {title:"na para bang", artist:"Mariah Deborah", cover:COVER_NPB, hue:350, mood:"heartbreak", src:"songs/09.mp3",
  lyrics:[
   [7.81,"'Pag ba ako'ng naunang maglahad ng palad"],
   [13.16,"At lumapit nang marahan, magtataka ka ba?"],
   [18.78,"'Di man ako halata, nagtitimping mag-isa"],
   [24.09,"Dinadaan na lang sa tula, tanong sa tadhana"],
   [30.47,"Oo, walang malisya para sa 'yo"],
   [35.7,"Sa akin mayro'n, kaya pasensiya na"],
   [42.23,"Kung puwede lang namang maibalik"],
   [44.71,"Sa dati ang lahat, pero hindi"],
   [47.91,"'Yong walang ilangan, puwede kang batukan"],
   [51.08,"Na para bang, para bang (kaibigan)"],
   [53.2,"Baka nga wala namang mali"],
   [55.35,"Kung mag-iba man ang aking tingin"],
   [58.35,"Nagpapakiramdaman, sana'y mapanindigan"],
   [64.95,"Ah, ah, ah"],
   [72.15,"Na para bang, para bang"],
   [74.08,"Ba't ba ako'y alipin ng kung anuman ang sasabihin nila?"],
   [79.52,"Nagkakaintindihan naman tayong dalawa"],
   [84.52,"'Di mawari kung pa'no nga ba 'to, magpapatuloy ba o hihinto?"],
   [89.93,"Eh, baka naman kasi lahat ay biglang magbago"],
   [96.48,"Oo, walang malisya (walang malisya) para sa 'yo"],
   [101.93,"Sa akin mayro'n na"],
   [105.6,"Kung puwede lang namang maibalik"],
   [108.02,"Sa dati ang lahat, pero hindi"],
   [111.33,"'Yong walang ilangan, puwede kang batukan"],
   [114.48,"Na para bang, para bang (kaibigan)"],
   [116.47,"Baka nga wala namang mali"],
   [118.65,"Kung mag-iba man ang aking tingin"],
   [121.69,"Nagpapakiramdaman, sana'y mapanindigan"],
   [128.33,"Ah, ah, ah"],
   [135.48,"Na para bang, para bang"],
   [138.86,"Ah, ah, ah"],
   [145.95,"Na para bang, para bang"],
   [147.43,"Sabi sa sarili ko, \"Wala lang 'to\""],
   [150.16,"Pero ba't sa 'yo na'ng aking Sabado?"],
   [152.74,"Ang sabi sa sarili ko, \"Wala lang 'to\""],
   [155.3,"\"Wala lang 'to, wala lang 'to\""],
   [158.06,"Sabi sa sarili ko, \"Wala lang 'to\""],
   [160.77,"Pero ba't sa 'yo na'ng aking Sabado?"],
   [163.01,"Ang sabi sa sarili ko, \"Wala lang 'to\""],
   [165.78,"\"Wala lang 'to, wala lang 'to\""],
   [171.15,"Walang malisya para sa 'yo"],
   [175.71,"Sa akin mayro'n, kaya pasensiya na"],
   [182.13,"Kung puwede lang namang maibalik"],
   [184.61,"Sa dati ang lahat, pero hindi"],
   [187.57,"'Yong walang ilangan, puwede kang batukan"],
   [191.09,"Na para bang, para bang (kaibigan)"],
   [193.09,"Baka nga wala namang mali"],
   [195.09,"Kung mag-iba man ang aking tingin"],
   [197.92,"Nagpapakiramdaman, sana'y mapanindigan"],
   [202.73,"Sabi sa sarili ko, \"Wala lang 'to\" (ah)"],
   [205.68,"Pero ba't sa 'yo na'ng aking Sabado? (Ah)"],
   [208.05,"Ang sabi sa sarili ko, \"Wala lang 'to\" (ah)"],
   [210.74,"\"Wala lang 'to, wala lang 'to\" (na para bang, para bang)"],
   [213.4,"Sabi sa sarili ko, \"Wala lang 'to\" (ah)"],
   [216.19,"Pero ba't sa 'yo na'ng aking Sabado? (Ah)"],
   [218.62,"Ang sabi sa sarili ko, \"Wala lang 'to\" (ah)"],
   [222.58,"Na para bang, para bang"]
  ]},
 {title:"tenchu", artist:"Esremborak", cover:COVER_TENCHU, hue:170, mood:"heartbreak", src:"songs/10.mp3",
  lyrics:[
   [18.49,"Pautangin mo"],
   [22.45,"Ito ang simula ng kanta kong ito"],
   [30.45,"Inaaalay ko sa 'yo nang iwan mo ako"],
   [37.62,"Pautangin mo ulit"],
   [48.63,"Nang makita kita"],
   [52.56,"Parang sa mundo ay gusto ka na mabura"],
   [60.85,"Please lang, Son Goku, ubusin mo sila"],
   [68.16,"Mga kampon sila ni Frieza"],
   [79,"Bakit pa nakilala pa kita?"],
   [85.56,"Nalimot na tuloy pakiramdam na mag-isa"],
   [94,"Sa lahat ng sakit na naidulot"],
   [101.59,"At sa pusong binabalot ng lungkot"],
   [109.56,"Doraemon, puwede bang pahiram naman ng gadyet"],
   [116.78,"Pang-alis ng sakit sa pakiramdam na nagamit?"],
   [124.67,"Madyik pambura, pambura sa alaala"],
   [132.12,"Sa mga sandaling hawak pa ang kamay niya"],
   [139.82,"Kung puwede lang namang hilingin sa Dragon Ball"],
   [152.57,"Sana 'di na lang"],
   [162.36,"'Di na magmumura"],
   [166.04,"Sayang lang ang galit sa mga katulad mong tanga"],
   [173.56,"Na 'di marunong tumimbang tunay na halaga"],
   [180.51,"Pautangin mo ulit"],
   [191.36,"Sana'y nahigop ka"],
   [195.28,"Ni Cell no'ng hindi pa buo tunay na anyo niya"],
   [202.66,"Sana ay si Krillin na lang ang natira"],
   [209.65,"Mas may kuwenta pa siya sa 'yo"],
   [219.83,"Bakit pa nakilala pa kita?"],
   [225.94,"Nalimot na tuloy pakiramdam na mag-isa"],
   [233.8,"Sa lahat ng sakit na naidulot"],
   [240.88,"At sa pusong binabalot ng lungkot"],
   [247.74,"Doraemon, puwede bang pahiram naman ng gadyet"],
   [254.59,"Pang-alis ng sakit sa pakiramdam na nagamit?"],
   [261.43,"Madyik pambura, pambura sa alaala"],
   [268.28,"Sa mga sandaling hawak pa ang kamay niya"],
   [274.81,"Kung puwede lang namang hilingin sa Dragon Ball"],
   [286.56,"Sana 'di na lang"],
   [314.25,"Doraemon, puwede bang pahiram naman ng gadyet"],
   [321.27,"Pang-alis ng sakit sa pakiramdam na nagamit?"],
   [328.62,"Madyik pambura, pambura sa alaala"],
   [336.05,"Sa mga sandaling hawak pa ang kamay niya"],
   [343.63,"Kung puwede lang namang hilingin sa Dragon Ball"],
   [359.63,"Sana maging masaya ka"]
  ]},
];
const PLACEHOLDER = ["Paste your lyrics here…","One line per entry in the SONGS list","Each line lights up as the song plays","Breathe in…","Breathe out…","Let the music heal"];
/* Paste raw lyrics between backticks: lyrics:`...`
   A line that starts with [mm:ss] or [mm:ss.xx] keeps that time, so you can paste
   a timestamped file straight in and get exact sync. [Verse]/[Chorus] labels, blank
   lines and markdown links are cleaned automatically.                          */
const cleanLyrics = t => {
    const out = [];
    t.split("\n").forEach(raw => {
        const line = raw.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").trim();
        const stamp = line.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/);
        const text = (stamp ? stamp[3] : line).replace(/\[[^\]]*\]/g, "").trim();
        if (!text) return;                  // blank line, or a [Verse]/[Chorus] label
        out.push(stamp ? [+(stamp[1] * 60 + +stamp[2]).toFixed(2), text] : text);
    });
    return out;
};
SONGS.forEach(s => {
    if (typeof s.lyrics === "string") s.lyrics = cleanLyrics(s.lyrics);
    s.lyrics = (s.lyrics && s.lyrics.length) ? s.lyrics : PLACEHOLDER;
});
// $ is shorthand for document.getElementById, so $("pp") finds id="pp"
const $ = id => document.getElementById(id);
const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
const PAUSE = '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
/* The app state: one object, one source of truth. Whatever you see on
   screen (current song, playing, volume, view, search text, premium) is a
   field here, and the render functions below draw the screen from it.   */
const S = {i:0, playing:false, shuffle:false, loop:0, vol:.8, muted:false, mode:"file", pos:0, view:"home", mood:"all", q:"", premium:false, skips:0, fade:1, speed:1, sleepAt:0, sleepMin:0, user:"", prof:{}, sub:null, hist:[], fav:[], queue:[], albums:[], album:null, logged:false};
const FREE_SKIPS = 5;
/* Tiny localStorage wrapper: JSON in, JSON out, never throws (so private
   browsing or a full disk cannot break the page).                       */
const store = {
    get(k,d) {
        try {
            const v = localStorage.getItem(k);
            return v ? JSON.parse(v) : d;
        }
        catch(e) {
            return d;
        }
    },
    set(k,v) {
        try {
            localStorage.setItem(k, JSON.stringify(v));
        }
        catch(e) {}
    },
    del(k) {
        try {
            localStorage.removeItem(k);
        }
        catch(e) {}
    }
};
const uk = k => k + ":" + S.user;
const DEF = {pa:.28, dim:0, autonext:true}, CFG = {...DEF};
const audio = new Audio();
audio.preload = "auto";
const SYNTH_LEN = 120;
/* ---------- 2. SMALL HELPERS ----------
   fmt()     seconds -> "m:ss"
   grad()    the cover image, or a colour gradient if the song has no art
   initial() first letter of a title, drawn on top of that gradient        */
const fmt = t => {
    t = Math.max(0, Math.floor(t||0));
    return Math.floor(t/60) + ":" + String(t%60).padStart(2,"0");
};
const grad = s => s.cover ? `url(${s.cover}) center/cover no-repeat` : `linear-gradient(135deg,hsl(${s.hue} 100% 64%),hsl(${s.hue+50} 95% 52%))`;
const initial = s => s.cover ? "" : s.title[0].toUpperCase();
const range = (el, v) => el.style.setProperty("--p", v + "%");
/* ---------- 3. FALLBACK TONE (Web Audio API) ----------
   If songs/XX.mp3 is missing, audio.play() fails and the app switches to a
   generated pentatonic pad so the demo still makes sound. None of this runs
   while a real mp3 is playing.                                            */
let ctx, master, oscs = [], synthStart = 0, synthBase = 0, lastChord = -1;
const SCALE = [0,2,4,7,9,12,14];
function chordFor(step) { // gentle pentatonic pad that changes every 6s, different per song
    const root = 196 * Math.pow(2, ((S.i * 2) % 12) / 12);
    const d = [0,3,1,4,2,5][step % 6];
    return [0,2,4].map(k => root * Math.pow(2, SCALE[(d + k) % 7] / 12));
}
function synthOn() {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    ctx.resume();
    master = master || Object.assign(ctx.createGain(), {});
    master.connect(ctx.destination);
    master.gain.value = S.muted ? 0 : S.vol * .35;
    oscs = [0,1,2].map(() => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "triangle";
        g.gain.value = .5;
        o.connect(g);
        g.connect(master);
        o.start();
        return o;
    });
    synthStart = ctx.currentTime;
    lastChord = -1;
    stepSynth();
}
function synthOff() {
    oscs.forEach(o => {
        try {
            o.stop()
        }
        catch(e) {}
    });
    oscs = [];
}
function stepSynth() {
    const step = Math.floor(synthPos() / 6);
    if (step !== lastChord) {
        lastChord = step;
        chordFor(step).forEach((f,k) => oscs[k] && oscs[k].frequency.setTargetAtTime(f, ctx.currentTime, .6));
    }
}
const synthPos = () => S.playing && S.mode === "synth" && ctx ? synthBase + ctx.currentTime - synthStart : S.pos;
/* ---------- 4. PLAYBACK ENGINE ----------
   load()   pick a song, reset the state, redraw
   play() / pause() / toggle()   what the big button calls
   next() / prev() / ended()     move through the list (shuffle + loop aware)
   canSkip()                     free users get 5 skips per session        */
const getTime = () => S.mode === "file" ? audio.currentTime : synthPos();
const getDur = () => S.mode === "file" ? (isFinite(audio.duration) ? audio.duration : 0) : SYNTH_LEN;
function load(i, autoplay) {
    synthOff();
    S.playing = false;
    S.i = i;
    S.logged = false;
    S.mode = "file";
    S.pos = 0;
    synthBase = 0;
    const s = SONGS[i];
    audio.src = s.src;
    audio.playbackRate = S.speed;
    document.documentElement.style.setProperty("--h", s.hue);
    renderNow();
    renderGrid();
    sync();
    if (autoplay) play();
}
function useSynth() {
    if (S.mode === "synth") return;
    synthOff();
    S.mode = "synth";
    S.playing = false;
    synthBase = 0;
    $("nB").textContent = "Demo tone · add songs/" + String(S.i+1).padStart(2,"0") + ".mp3 for the real track";
    renderLyrics();
    play();
}
function play() {
    if (S.mode === "file") {
        audio.play().then(() => {
            S.playing = true;
            sync();
            logPlay();
        }).catch(() => useSynth());
    } else {
        S.playing = true;
        synthOn();
        sync();
        logPlay();
    }
}
function pause() {
    if (S.mode === "file") audio.pause();
    else {
        synthBase = synthPos();
        S.pos = synthBase;
        synthOff();
    }
    S.playing = false;
    sync();
}
const toggle = () => S.playing ? pause() : play();
function seekTo(t) {
    if (S.mode === "file") audio.currentTime = t;
    else {
        synthBase = t;
        S.pos = t;
        synthStart = ctx ? ctx.currentTime : 0;
        lastChord = -1;
    }
}
function canSkip() {
    if (S.premium) return true;
    if (S.skips >= FREE_SKIPS) {
        toast("Skip limit reached. Go Premium for unlimited skips.");
        openModal();
        return false;
    }
    S.skips++;
    if (S.skips >= FREE_SKIPS - 1) toast(`Free plan: ${FREE_SKIPS - S.skips} skip(s) left`);
    return true;
}
/* What next/prev/autoplay walk, in order: the open album or Queue, else every
   song. The album's own order is used as-is, so an album plays as you built it. */
const playOrder = () => {
    const list = S.album !== null ? albumSongs().filter(i => SONGS[i]) : [];
    return list.length ? list : SONGS.map((s, i) => i);
};
function next(auto) {
    if (!auto && !canSkip()) return;
    const order = playOrder(), n = order.length, at = order.indexOf(S.i);
    if (S.shuffle && n > 1) {
        let r;
        do r = Math.floor(Math.random()*n);
        while (order[r] === S.i);
        return load(order[r], true);
    }
    if (at === -1) return load(order[0], true);           // playing outside this album
    if (auto && S.loop === 0 && at === n-1) return load(order[0], false);
    load(order[(at + 1) % n], true);
}
function prev() {
    if (getTime() > 3) return seekTo(0);
    if (!canSkip()) return;
    const order = playOrder(), at = order.indexOf(S.i);
    load(order[at <= 0 ? order.length - 1 : at - 1], true);
}
const ended = () => S.loop === 2 ? (seekTo(0), play()) : (CFG.autonext ? next(true) : (pause(), seekTo(0)));
audio.addEventListener("ended", ended);
audio.addEventListener("error", () => {
    if (S.mode === "file") useSynth();
});
audio.addEventListener("loadedmetadata", () => {
    renderLyrics();
});
/* ---------- 5. RENDERING (state -> screen) ----------
   renderNow()    right-hand panel and player bar: art, title, artist
   renderLyrics() build the lyric <p> lines, evenly spaced in time by default
   renderGrid()   the song cards; also applies the mood filter + search     */
function renderNow() {
    const s = SONGS[S.i];
    ["nArt","pArt"].forEach(id => {
        $(id).style.background = grad(s);
        $(id).textContent = initial(s);
    });
    $("nT").textContent = $("pT").textContent = s.title;
    $("nA").textContent = $("pA").textContent = s.artist;
    $("nB").textContent = "";
    renderLyrics();
}
let lines = [], activeLine = -1;
/* Any silence of 9s or more is instrumental: the intro, a break between verses,
   or the outro. Shorter pauses are just a singer taking a breath.              */
const INST_GAP = 9;
function withInstrumentals(list, dur) {
    /* A few tracks sing almost without pausing, so no silence ever reaches
       INST_GAP and they would show no marker at all. For those, mark their one
       longest pause instead (as long as it is a real break, not a breath).     */
    let need = INST_GAP;
    if (dur > 0 && list.length > 1) {
        let longest = 0;
        list.forEach((l, k) => {
            const g = (list[k + 1] ? list[k + 1].t : dur) - l.t;
            if (g > longest) longest = g;
        });
        if (longest < need && longest >= 5) need = longest;
    }
    const out = [];
    const mark = t => out.push({t, x: "[Instrumental]", inst: true});
    list.forEach((l, k) => {
        const next = list[k + 1];
        if (k === 0 && l.t >= need) mark(0);               // instrumental intro
        out.push(l);
        const gap = (next ? next.t : dur) - l.t;
        if (gap >= need) mark(l.t + gap / 2);              // middle of the silence
    });
    return out;
}
function renderLyrics() {
    const s = SONGS[S.i], real = getDur(), dur = real || SYNTH_LEN, n = s.lyrics.length;
    const timed = s.lyrics.some(l => Array.isArray(l));
    lines = s.lyrics.map((l,k) => Array.isArray(l) ? {t:l[0], x:l[1]} : {
        t: (k + .5) * dur / n, x: l
    });
    if (timed) lines = withInstrumentals(lines, real); // real: 0 until the mp3 loads
    $("lyr").innerHTML = lines.map((l,k) => `<p data-k="${k}"${l.inst ? " data-inst" : ""}>${l.x.replace(/</g,"&lt;")}</p>`).join("");
    padLyrics();
    activeLine = -1;
}
/* half the box's own height as padding, so the first and last line can still be
   centred. Measured live because the box is hidden (height 0) until lyrics open. */
function padLyrics() {
    const b = $("lyr");
    b.style.paddingBlock = "0px";          // measure the space flex gives it first,
    const h = b.clientHeight;             // or the old padding floors the box and
    b.style.paddingBlock = Math.round(h / 2) + "px";   // pushes the queue out of the panel
}
window.addEventListener("resize", padLyrics);
$("lyr").addEventListener("click", e => {
    const p = e.target.closest("p");
    if (p) {
        if (!S.premium) {
            toast("Tap-to-jump lyrics is a Premium feature ★");
            return openModal();
        }
        seekTo(lines[+p.dataset.k].t);
        if(!S.playing) play();
    }
});
/* An album is a name and a list of song indexes. "fav" is the one built-in
   album: it is S.fav, so the apple button on a card is what fills it.      */
const albumSongs = () => S.album === "fav" ? S.fav : S.album === "queue" ? S.queue : (S.albums[S.album] ? S.albums[S.album].songs : []);
const albumName = () => S.album === "fav" ? "★ Favorites" : S.album === "queue" ? "▶ Queue" : (S.albums[S.album] ? S.albums[S.album].name : "Album");
function visible() {
    if (S.album !== null) return albumSongs().filter(i => SONGS[i]).map(i => ({s: SONGS[i], i}));
    const q = S.q.trim().toLowerCase();
    return SONGS.map((s,i) => ( {
        s,i
    })).filter(({s}) =>
    (S.mood === "all" || s.mood === S.mood) && (!q || (s.title + " " + s.artist).toLowerCase().includes(q)));
}
function renderGrid() {
    const list = visible();
    const names = {all:"Your 10 songs", heartbreak:"Heartbreak & Healing", faith:"Faith & Hope"};
    $("ttl").textContent = S.album !== null ? albumName() : S.q ? `Results for “${S.q}”` : (S.view === "lib" ? "Your Library" : names[S.mood]);
    $("grid").innerHTML = list.length ? list.map(({s,i}) => {
        const f = S.fav.includes(i);
        return `
    <div class="card ${i === S.i ? "cur" : ""}">
    <div class="thumb"><div class="art" style="background:${grad(s)}">${initial(s)}</div><div class="eq"><i></i><i></i><i></i></div>
    <button class="play" data-i="${i}" aria-label="Play ${s.title}">${i === S.i && S.playing ? PAUSE : PLAY}</button></div>
    <b>${s.title}</b><span>${s.artist}</span>
    <div class="cardacts"><button class="fav${f ? " on" : ""}" data-fav="${i}" aria-pressed="${f}" aria-label="${f ? "Unfavorite" : "Favorite"} ${s.title}"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="body" d="M12 7.6c-1.5-1.9-4.6-2-6.2.5-1.9 3-.6 9.4 3.1 12.5.9.7 2.3.4 3.1.4s2.2.3 3.1-.4c3.7-3.1 5-9.5 3.1-12.5-1.6-2.5-4.7-2.4-6.2-.5z"/><path class="stem" d="M12.2 7.4c-.2-1.6.4-2.9 1.6-3.7"/></svg><span class="fav-t">${f ? "Favorited" : "Favorite"}</span></button><button class="addal" data-add="${i}" aria-label="Add ${s.title} to an album" title="Add to album">＋</button></div>
    </div>`;
    }).join("") : `<p class="empty">${S.album !== null ? "This album is empty. Tap ＋ on any song card to add one." : "No songs match your search. Try another word."}</p>`;
}
/* The star under a card adds or removes that song from favorites. Only the one
   button is touched, and the list is kept per user in localStorage.          */
function toggleFav(i, btn) {
    const k = S.fav.indexOf(i), on = k === -1;
    if (on) S.fav.push(i); else S.fav.splice(k, 1);
    store.set(uk("mtFav"), S.fav);
    btn.classList.toggle("on", on);
    btn.querySelector(".fav-t").textContent = on ? "Favorited" : "Favorite";
    btn.setAttribute("aria-pressed", on);
    btn.setAttribute("aria-label", (on ? "Unfavorite " : "Favorite") + SONGS[i].title);
    toast(`${on ? "Added" : "Removed"} “${SONGS[i].title}” ${on ? "to" : "from"} favorites`);
    renderAlbums();
    if (S.album === "fav") renderGrid();   // the open Favorites album gained or lost a song
}
/* ---------- 5c. ALBUMS ----------
   An album is a name and a list of song indexes, saved per user. Favorites is
   the built-in one: it is S.fav, so the apple on a card fills it, and it cannot
   be renamed or deleted. The ＋ sheet adds songs and manages the rest.       */
const saveAlbums = () => store.set(uk("mtAlbums"), S.albums);
function renderAlbums() {
    const row = (id, name, n) => `<button data-album="${id}" class="${S.album === id ? "on" : ""}">${esc(name)}<span class="c">${n}</span></button>`;
    $("albums").innerHTML = row("fav", "★ Favorites", S.fav.length) +
        row("queue", "▶ Queue", S.queue.length) +
        S.albums.map((a, k) => row(k, a.name, a.songs.length)).join("");
}
let alTarget = null;          // song being added from its ＋, or null when managing
let alEdit = null;            // {k, mode:"rename"|"delete"} for the row being edited
/* The queue as it appears down the right side: hidden until something is queued,
   each row plays that song, and its ✕ takes it back out.                     */
function renderQueue() {
    const n = S.queue.length;
    $("qwrap").hidden = !n;
    $("qcount").textContent = n ? n + (n === 1 ? " song" : " songs") : "";
    $("qlist").innerHTML = S.queue.map((i, k) =>
        `<div class="qrow"><button class="qplay" data-qplay="${i}"><span>${esc(SONGS[i].title)}</span><small>${esc(SONGS[i].artist)}</small></button><button class="qx" data-qx="${k}" aria-label="Remove ${esc(SONGS[i].title)} from the queue">✕</button></div>`).join("");
    padLyrics();     // the lyrics got shorter or taller with the queue block
}
$("qlist").addEventListener("click", e => {
    const play = e.target.closest("[data-qplay]");
    if (play) return load(+play.dataset.qplay, true);
    const x = e.target.closest("[data-qx]");
    if (!x) return;
    S.queue.splice(+x.dataset.qx, 1);
    store.set(uk("mtQueue"), S.queue);
    renderQueue();
    renderAlbums();
    if (S.album === "queue") renderGrid();
});
function openAlbums(i) {
    alTarget = i === undefined ? null : i;
    alEdit = null;
    albumSheet();
}
/* Redraws the open sheet for the current alTarget/alEdit without resetting them,
   so a row can switch into rename or delete mode and stay there.            */
function albumSheet() {
    const add = alTarget !== null, A = S.albums;
    const qIn = add && S.queue.includes(alTarget);
    const qRow = `<div class="alrow${qIn ? " on" : ""}"><button class="alname" data-queue>▶ Queue</button><b>${add ? (qIn ? "✓ queued" : "queue it") : S.queue.length + (S.queue.length === 1 ? " song" : " songs")}</b></div>`;
    const rows = A.length ? A.map((a, k) => {
        if (alEdit && alEdit.k === k) {
            return alEdit.mode === "rename"
                ? `<div class="alrow"><input class="field alin" id="alRen" maxlength="24" value="${esc(a.name)}" aria-label="Album name"><button class="almini ok" data-rensave="${k}">Save</button><button class="almini" data-cancel>✕</button></div>`
                : `<div class="alrow"><span>Delete “${esc(a.name)}”?</span><button class="almini ok" data-deldo="${k}">Delete</button><button class="almini" data-cancel>Keep</button></div>`;
        }
        const has = add && a.songs.includes(alTarget);
        return `<div class="alrow${has ? " on" : ""}"><button class="alname" data-al="${k}">${esc(a.name)}</button><b>${add ? (has ? "✓ added" : "add") : a.songs.length + (a.songs.length === 1 ? " song" : " songs")}</b>${add ? "" : `<button class="almini" data-ren="${k}" aria-label="Rename ${esc(a.name)}">✎</button><button class="almini" data-del="${k}" aria-label="Delete ${esc(a.name)}">✕</button>`}</div>`;
    }).join("") : `<p class="empty">${add ? "No albums yet — name one below." : "No albums yet. Name one below and it is ready to use."}</p>`;
    $("alBody").innerHTML = `<h2>${add ? "Add to an album" : "Your albums"}</h2>
    <p>${add ? `“${esc(SONGS[alTarget].title)}” — tap an album to add or remove it.` : "Tap an album to open it."}</p>
    <div class="alrows">${qRow}${rows}</div>
    ${add ? "" : "<div class=\"alrow perm\"><span>★ Favorites</span><b>always there</b></div>"}
    <label class="lbl" for="alName">New album</label>
    <div class="alnew"><input class="field" id="alName" maxlength="24" placeholder="Album name"><button class="cta" id="alGo">Create</button></div>`;
    $("albumModal").hidden = false;
    ($("alRen") || $("alName")).focus();
}
function closeAlbums() {
    $("albumModal").hidden = true;
}
function createAlbum() {
    const n = $("alName").value.trim();
    if (!n) return toast("Give the album a name first");
    S.albums.push({name: n, songs: alTarget === null ? [] : [alTarget]});
    saveAlbums();
    renderAlbums();
    toast(`Created “${n}”`);
    albumSheet();
}
function renameAlbum(k, n) {
    n = n.trim();
    if (!n) return toast("Give the album a name first");
    S.albums[k].name = n;
    saveAlbums();
    renderAlbums();
    if (S.album === k) renderGrid();
    toast(`Renamed to “${n}”`);
    alEdit = null;
    albumSheet();
}
/* Deleting shifts every album after it, so an open album number moves down. */
function deleteAlbum(k) {
    const [gone] = S.albums.splice(k, 1);
    saveAlbums();
    if (S.album === k) {
        S.album = null;
        renderGrid();
    } else if (typeof S.album === "number" && S.album > k) S.album--;
    renderAlbums();
    toast(`Deleted “${gone.name}”`);
    alEdit = null;
    albumSheet();
}
$("newAl").onclick = () => openAlbums();
$("alX").onclick = closeAlbums;
$("albumModal").addEventListener("click", e => {
    if (e.target.id === "albumModal") closeAlbums();
});
$("albums").addEventListener("click", e => {
    const b = e.target.closest("[data-album]");
    if (!b) return;
    const id = b.dataset.album;                    // "fav", "queue" or an album index
    setView("home", isNaN(+id) ? id : +id);
});
$("alBody").addEventListener("click", e => {
    if (e.target.id === "alGo") return createAlbum();
    const el = e.target.closest("button"), d = el ? el.dataset : {};
    if (d.queue !== undefined) {
        if (alTarget === null) {
            closeAlbums();
            return setView("home", "queue");
        }
        const at = S.queue.indexOf(alTarget);
        if (at === -1) {
            S.queue.push(alTarget);
            toast(`Queued “${SONGS[alTarget].title}”`);
        } else {
            S.queue.splice(at, 1);
            toast("Removed from the queue");
        }
        store.set(uk("mtQueue"), S.queue);
        renderAlbums();
        renderQueue();
        if (S.album === "queue") renderGrid();
        return albumSheet();
    }
    if (d.cancel !== undefined) { alEdit = null; return albumSheet(); }
    if (d.ren !== undefined) { alEdit = {k: +d.ren, mode: "rename"}; return albumSheet(); }
    if (d.rensave !== undefined) return renameAlbum(+d.rensave, $("alRen").value);
    if (d.del !== undefined) { alEdit = {k: +d.del, mode: "delete"}; return albumSheet(); }
    if (d.deldo !== undefined) return deleteAlbum(+d.deldo);
    if (d.al === undefined) return;
    const k = +d.al;
    if (alTarget === null) {
        closeAlbums();
        return setView("home", k);
    }
    const a = S.albums[k], at = a.songs.indexOf(alTarget);
    if (at === -1) {
        a.songs.push(alTarget);
        toast(`Added to “${a.name}”`);
    } else {
        a.songs.splice(at, 1);
        toast(`Removed from “${a.name}”`);
    }
    saveAlbums();
    renderAlbums();
    if (S.album === k) renderGrid();
    albumSheet();
});
$("alBody").addEventListener("keydown", e => {
    if (e.key === "Enter" && e.target.id === "alName") createAlbum();
    else if (e.key === "Enter" && e.target.id === "alRen") renameAlbum(alEdit.k, e.target.value);
    else if (e.key === "Escape" && e.target.id === "alRen") { alEdit = null; albumSheet(); }
});
$("grid").addEventListener("click", e => {
    const add = e.target.closest(".addal");
    if (add) return openAlbums(+add.dataset.add);
    const star = e.target.closest(".fav");
    if (star) return toggleFav(+star.dataset.fav, star);   // the buttons must not start the song
    const c = e.target.closest(".card");
    if (!c) return;
    const i = +c.querySelector(".play").dataset.i;
    i === S.i ? toggle() : load(i, true);
});
/* Redraws the small state-dependent bits: play/pause icon, shuffle and loop
   lights, mute icon, which card is current, and the tab title.           */
function sync() {
    document.body.classList.toggle("playing", S.playing); // drives the enlarged bar
    $("pp").innerHTML = S.playing ? PAUSE : PLAY;
    $("pp").setAttribute("aria-label", S.playing ? "Pause" : "Play");
    $("shuf").classList.toggle("act", S.shuffle);
    $("loop").classList.toggle("act", S.loop > 0);
    $("loop").textContent = S.loop === 2 ? "①" : "⟲";
    $("mute").textContent = S.muted || S.vol === 0 ? "🔇" : "🔉";
    document.querySelectorAll(".card").forEach((c,k) => {
        const idx = +c.querySelector(".play").dataset.i;
        c.classList.toggle("cur", idx === S.i);
        c.classList.toggle("playing", idx === S.i && S.playing);
        c.querySelector(".play").innerHTML = idx === S.i && S.playing ? PAUSE : PLAY;
    });
    document.title = S.playing ? `${SONGS[S.i].title} · Music Therapy` : "Music Therapy"
    ;
}
/* ---------- 6. THE CLOCK ----------
   tick() runs 5x a second: expires Premium, fades the sleep timer, moves the
   seek bar, and highlights the lyric line that matches the current time.   */
let dragging = false;
function tick() {
    if (S.premium && S.sub && S.sub.expires <= Date.now()) {
        S.premium = false;
        S.sub = null;
        store.del(uk("mtSub"));
        refreshPlan();
        toast("Your Premium has expired. Renew to keep the perks.");
    }
    if (S.sleepAt) {
        const left = S.sleepAt - Date.now();
        S.fade = Math.max(0, Math.min(1, left / 10000));
        gain();
        if (left <= 0) {
            pause();
            S.sleepAt = 0;
            S.fade = 1;
            gain();
            toast("Sleep timer finished. Rest well 🌙");
            renderModal();
        }
    }
    const t = getTime(), d = getDur();
    if (S.mode === "synth" && S.playing) {
        stepSynth();
        if (t >= d) ended();
    }
    if (!dragging) {
        $("seek").value = d ? t / d * 1000 : 0;
        range($("seek"), d ? t / d * 100 : 0);
    }
    $("cur").textContent = fmt(t);
    $("rem").textContent = "-" + fmt(d - t);
    let k = -1;
    /* a timestamp marks when its line starts being sung. The old -1 lit every line a
       full second early, which reads as "off" once the times are real; 0.2s only
       absorbs the 5x/second tick. */
    for (let j = 0; j < lines.length; j++) if (t >= lines[j].t - .2) k = j;
    if (k !== activeLine) {
        activeLine = k;
        const ps = $("lyr").children;
        [...ps].forEach((p,j) => {
            p.classList.toggle("on", j === k);
            p.classList.toggle("past", j < k);
        });
        /* scroll the lit line to the middle of the panel. Measured with rects on purpose:
           offsetTop is relative to the nearest *positioned* ancestor (the fixed .now panel),
           not to the scrolling box, which threw the scroll ~300px off and left the line
           hidden outside the visible area. */
        if (ps[k]) {
            const box = $("lyr").getBoundingClientRect(), ln = ps[k].getBoundingClientRect();
            $("lyr").scrollTo({top: $("lyr").scrollTop + ln.top - box.top - box.height/2 + ln.height/2});
        }
    }
}
setInterval(tick, 200);
/* ---------- 7. CONTROLS ----------
   Every button from index.html is wired here: play, next, prev, shuffle,
   loop, seek, volume, mute, lyrics toggle, and the keyboard shortcuts.      */
$("pp").onclick = toggle;
$("next").onclick = () => next(false);
$("prev").onclick = prev;
$("shuf").onclick = () => {
    S.shuffle = !S.shuffle;
    sync();
};
$("loop").onclick = () => {
    S.loop = (S.loop + 1) % 3;
    sync();
};
$("seek").addEventListener("input", e => {
    dragging = true;
    const d = getDur();
    range(e.target, e.target.value/10);
    $("cur").textContent = fmt(e.target.value/1000*d);
});
$("seek").addEventListener("change", e => {
    seekTo(e.target.value/1000 * getDur());
    dragging = false;
});
function gain() {
    const g = (S.muted ? 0 : S.vol) * S.fade;
    audio.volume = g;
    if (master) master.gain.value = g * .35;
}
function applyVol() {
    gain();
    $("vol").value = S.muted ? 0 : S.vol * 100;
    range($("vol"), $("vol").value);
    sync();
}
$("vol").addEventListener("input", e => {
    S.vol = e.target.value/100;
    S.muted = S.vol === 0;
    applyVol();
});
$("mute").onclick = () => {
    S.muted = !S.muted;
    if (!S.muted && S.vol === 0) S.vol = .5;
    applyVol();
};
$("lyrBtn").onclick = () => {
    document.body.classList.toggle("lyr");
    padLyrics();        // the box only has a height once the panel is visible
    activeLine = -1;    // repaint + recentre on the next tick
};
/* ---------- 7b. FULL-SCREEN PLAYER ----------
   The whole footer goes full screen (styles.css §7b) with the lyric sheet docked
   below it. Full screen always shows lyrics; leaving it puts them back as they
   were before, so the button does not silently flip the reading mode on you.   */
let fsLyrics = false;
function toggleFs() {
    const on = !document.body.classList.contains("fs");
    if (on) {
        fsLyrics = document.body.classList.contains("lyr");
        document.body.classList.add("lyr");
    } else if (!fsLyrics) {
        document.body.classList.remove("lyr");
    }
    document.body.classList.toggle("fs", on);
    $("fsBtn").textContent = on ? "⤡" : "⤢";
    $("fsBtn").setAttribute("aria-label", on ? "Exit full screen" : "Full screen player");
    padLyrics();
    activeLine = -1;
}
$("fsBtn").onclick = toggleFs;
document.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT" && e.target.type !== "range") return;
    if (e.code === "Space" && e.target.tagName !== "BUTTON") {
        e.preventDefault();
        toggle();
    }
    if (e.code === "ArrowRight" && e.shiftKey) next(false);
    if (e.code === "ArrowLeft" && e.shiftKey) prev();
    if (e.code === "Escape" && document.body.classList.contains("fs")) toggleFs();
});
/* ---------- 8. VIEWS, MOOD FILTER, SEARCH ----------
   setView() swaps Home / Search / Library by toggling classes on <main>.
   styles.css §5: .main.searching shows the search box and hides the hero.  */
/* album: null for the normal views, or "fav"/an album index to show that one. */
function setView(v, album = null) {
    S.view = v;
    S.mood = "all";
    S.album = album;
    S.q = "";
    $("q").value = "";
    const m = $("main");
    m.classList.toggle("searching", v === "search");
    m.classList.toggle("lib", v === "lib");
    document.querySelectorAll("[data-v]").forEach(b => b.classList.toggle("on", b.dataset.v === v));
    document.body.classList.remove("lyr");
    renderAlbums();
    renderGrid();
    if (v === "search") $("q").focus();
    $("main").scrollTop = 0;
}
document.querySelectorAll("[data-v]").forEach(b => b.onclick = () => setView(b.dataset.v));
document.querySelectorAll("[data-mood]").forEach(b => b.onclick = () => {
    setView("home");
    S.mood = b.dataset.mood;
    renderGrid();
});
$("q").addEventListener("input", e => {
    S.q = e.target.value;
    renderGrid();
    sync();
});
/* ---------- 9. ACCOUNTS, PREMIUM, MONEY (demo) ----------
   Everything here is local: the "account" is a name in localStorage and the
   checkout is simulated. No server, no real payment.                        */
const PLANS = {month:{name:"Monthly", price:99, days:30, per:"month"}, year:{name:"Yearly", price:499, days:365, per:"year"}};
const peso = n => "₱" + n.toLocaleString("en-PH");
const dateFmt = t => new Date(t).toLocaleDateString("en-PH", {year:"numeric", month:"short", day:"numeric"});
const dispName = () => S.prof.name || S.user;
const AV_HUES = [260, 330, 190, 40, 150];
const avBg = (o) => o.photo ? `background:url(${o.photo}) center/cover` : `background: linear-gradient(135deg,hsl(${o.hue ?? 260} 100% 70%),hsl(${(o.hue ?? 260) + 50} 95% 60%))`;
const avInit = o => o.photo ? "" : esc(((o.name || S.user)[0] || "?").toUpperCase());
const esc = t => String(t).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let tt; function toast(m) {
    const t = $("toast");
    t.textContent = m;
    t.classList.add("show");
    clearTimeout(tt);
    tt = setTimeout(() => t.classList.remove("show"), 3200);
}
const saveCfg = () => store.set(uk("mtCfg"), CFG);
function applyCfg() {
    const r = document.documentElement.style;
    r.setProperty("--pa", CFG.pa);
    r.setProperty("--dim", CFG.dim);
}
function logPlay() {
    if (S.logged || !S.user) return;
    S.logged = true;
    S.hist.unshift({i:S.i, t:Date.now()});
    S.hist = S.hist.slice(0, 50);
    store.set(uk("mtHist"), S.hist);
}
function refreshPlan() {
    document.body.classList.toggle("premium", S.premium);
    $("plan").textContent = S.premium ? "★ Premium member" : "";
    const m = $("meTop");
    m.setAttribute("style", S.user ? avBg(S.prof) : "");
    m.textContent = S.user ? avInit({...S.prof, name:dispName()}) : "☺";
}
/* sign in / sign out */
function startSession(name) {
    S.user = name;
    store.set("mtUser", name);
    S.prof = store.get(uk("mtProf"), {});
    S.sub = store.get(uk("mtSub"), null);
    S.hist = store.get(uk("mtHist"), []);
    S.fav = store.get(uk("mtFav"), []) || [];
    S.albums = store.get(uk("mtAlbums"), []) || [];
    S.queue = store.get(uk("mtQueue"), []) || [];
    S.album = null;
    Object.assign(CFG, DEF, store.get(uk("mtCfg"), {}));
    S.premium = !!(S.sub && S.sub.expires > Date.now());
    if (S.sub && !S.premium) {
        S.sub = null;
        store.del(uk("mtSub"));
    }
    S.skips = 0;
    applyCfg();
    refreshPlan();
    renderAlbums();    // favorites, queue and albums are per user
    renderQueue();
    renderGrid();
    $("auth").hidden = true;
    toast("Welcome, " + dispName());
}
function signOut() {
    if (S.playing) pause();
    load(0, false);
    S.speed = 1;
    audio.playbackRate = 1;
    S.sleepAt = 0;
    S.fade = 1;
    gain();
    store.del("mtUser");
    S.user = "";
    S.prof = {};
    S.premium = false;
    S.sub = null;
    S.hist = [];
    document.documentElement.style.setProperty("--pa", DEF.pa);
    document.documentElement.style.setProperty("--dim", DEF.dim);
    closeAll();
    refreshPlan();
    $("uName").value = "";
    $("auth").hidden = false;
    $("uName").focus();
}
$("uGo").onclick = () => startSession(($("uName").value.trim() || "Guest").slice(0, 20));
$("uName").addEventListener("keydown", e => {
    if (e.key === "Enter") $("uGo").click();
});
/* ---------- 9b. PREMIUM MODAL (3 steps) ----------
   P.step: 'choose' a plan -> 'pay' a mobile number -> 'done' receipt.
   renderPrem() redraws #mBody for whichever step is active.                 */
const P = {step:"choose", plan:"year", method:"gcash", num:"", err:"", busy:false};
function renderPrem() {
    const b = $("mBody"), pl = PLANS[P.plan];
    let h = "";
    const chips = (attr, list, cur) => list.map(([v,l]) => `<button data-${attr}="${v}" class="${String(cur) === String(v) ? "on" : ""}">${l}</button>`).join("");
    if (P.step === "done") {
        const x = S.sub;
        h = `<h2>Payment successful ★</h2><p>Thank you, ${esc(dispName())}! Premium is now active.</p>
        <div class="receipt"><div><span>Plan</span><b>${PLANS[x.plan].name}</b></div><div><span>Amount paid</span><b>${peso(x.price)}</b></div>
        <div><span>Method</span><b>${x.method === "gcash" ? "GCash" : "Maya"}</b></div><div><span>Reference</span><b>${x.ref}</b></div>
        <div><span>Valid until</span><b>${dateFmt(x.expires)}</b></div></div>
        <button class="cta" data-act="close">Start listening</button>`;
    } else if (P.step === "pay") {
        h = `<h2>Checkout</h2><p>${pl.name} plan · ${peso(pl.price)} per ${pl.per}</p>
        <h4 style="font-size:13px;margin-bottom:8px">Pay with</h4><div class="chips">${chips("method", [["gcash","GCash"],["maya","Maya"]], P.method)}</div>
        <label class="lbl" for="payNum">Mobile number</label>
        <input class="field" id="payNum" inputmode="numeric" maxlength="11" placeholder="09XXXXXXXXX" value="${esc(P.num)}" style="margin-bottom:4px">
        <div class="err">${P.err}</div>
        <div class="note">Classroom demo: this checkout is simulated and no real money is charged. Please do not enter real account details.</div>
        <button class="cta" data-act="confirm" ${P.busy ? "disabled" : ""}>${P.busy ? "Processing…" : "Pay " + peso(pl.price)}</button>
        <button class="link" data-act="back">← Back to plans</button>`;
    } else if (S.premium && P.step === "plans") {
        const x = S.sub;
        h = `<h2>You're Premium ★</h2><p>${PLANS[x.plan].name} plan · valid until <b>${dateFmt(x.expires)}</b></p>
        <div id="tools"><h4>Sleep timer</h4><div class="chips">${chips("sleep", [[0,"Off"],[15,"15 min"],[30,"30 min"],[60,"60 min"]], S.sleepAt ? S.sleepMin : 0)}</div>
        <h4>Playback speed</h4><div class="chips">${chips("speed", [[0.75,"0.75x"],[1,"1x"],[1.25,"1.25x"],[1.5,"1.5x"]], S.speed)}</div></div>
        <button class="cta" data-act="renew">Renew or change plan</button>
        <button class="link" data-act="cancel">Cancel subscription</button>`;
    } else {
        h = `<h2>Go Premium ★</h2><p>Pay to unlock Premium. Free users get 5 skips per session and read-only lyrics.</p>
        <div class="plans2">
        <button class="pcard ${P.plan === "month" ? "on" : ""}" data-plan="month"><b>Monthly</b><strong>₱99</strong><span>per month</span></button>
        <button class="pcard ${P.plan === "year" ? "on" : ""}" data-plan="year"><em>Best value · save ₱689</em><b>Yearly</b><strong>₱499</strong><span>per year (about ₱42/month)</span></button>
        </div>
        <ul class="perks"><li>Unlimited skips</li><li>Sleep timer with gentle fade-out</li><li>Playback speed 0.75x to 1.5x</li><li>Tap any lyric line to jump to it</li><li>Gold member badge</li></ul>
        <button class="cta" data-act="pay">Continue · ${peso(pl.price)}</button>`;
    }
    b.innerHTML = h;
}
function renderModal() {
    renderPrem();
    refreshPlan();
}
function openModal() {
    P.step = S.premium ? "plans" : "choose";
    P.err = "";
    P.busy = false;
    renderPrem();
    $("modal").hidden = false;
    $("mX").focus();
}
function closeModal() {
    $("modal").hidden = true;
}
function confirmPay() {
    if (!/^09\d{9}$/.test(P.num)) {
        P.err = "Enter a valid 11-digit mobile number starting with 09.";
        return renderPrem();
    }
    P.err = "";
    P.busy = true;
    renderPrem();
    setTimeout(() => {
        const pl = PLANS[P.plan], now = Date.now();
        S.sub = {plan:P.plan, price:pl.price, method:P.method, ref:"MT-" + Math.floor(10000000 + Math.random()*89999999), paidAt:now, expires:now + pl.days*864e5};
        store.set(uk("mtSub"), S.sub);
        S.premium = true;
        S.skips = 0;
        P.busy = false;
        P.step = "done";
        P.num = "";
        renderModal();
        toast("Welcome to Premium ★");
    }, 1600);
}
function cancelSub() {
    S.sub = null;
    S.premium = false;
    store.del(uk("mtSub"));
    S.speed = 1;
    audio.playbackRate = 1;
    S.sleepAt = 0;
    S.fade = 1;
    gain();
    P.step = "choose";
    refreshPlan();
    toast("Subscription cancelled");
}
$("goPro").onclick = $("premTop").onclick = openModal;
$("mX").onclick = closeModal; $("modal").addEventListener("click", e => {
    if (e.target.id === "modal") closeModal();
});
$("mBody").addEventListener("input", e => {
    if (e.target.id === "payNum") {
        P.num = e.target.value.replace(/\D/g, "");
        e.target.value = P.num;
    }
});
$("mBody").addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    const d = b.dataset;
    if (d.plan) P.plan = d.plan;
    else if (d.method) P.method = d.method;
    else if (d.speed) {
        S.speed = +d.speed;
        audio.playbackRate = S.speed;
        toast("Speed " + S.speed + "x" + (S.mode === "synth" ? " (applies to real song files)" : ""));
    }
    else if (d.sleep !== undefined) {
        const m = +d.sleep;
        S.sleepMin = m;
        S.sleepAt = m ? Date.now() + m*60000 : 0;
        S.fade = 1;
        gain();
        toast(m ? `Music will fade out in ${m} minutes 🌙` : "Sleep timer off");
    }
    else if (d.act === "pay") {
        P.step = "pay";
        P.err = "";
    }
    else if (d.act === "back" || d.act === "renew") {
        P.step = "choose";
    }
    else if (d.act === "close") return closeModal();
    else if (d.act === "cancel") {
        if (confirm("Cancel Premium? You will lose Premium features right away (demo).")) cancelSub();
    }
    else if (d.act === "confirm") return confirmPay();
    renderPrem();
});
/* ---------- 9c. THE "ME" SHEET ----------
   meView decides what #meBody shows: menu, profile, settings or history.    */
let meView = "menu", draft = null;
function profileHTML(back) {
    const d = draft;
    return `${back}<h2>Edit profile</h2>
    <div class="prof" style="margin:10px 0 4px"><div class="avatar" style="${avBg(d)}">${avInit(d)}</div>
    <div><label class="chip" style="cursor:pointer;display:inline-block;padding:8px 14px">Change photo<input type="file" id="pFile" accept="image/*" hidden></label>${d.photo ? ` <button class="link" data-go="rmphoto" style="display:inline;margin:0 0 0 10px">Remove</button>` : ""}</div></div>
    <label class="lbl" for="pName">Display name</label><input class="field" id="pName" maxlength="20" value="${esc(d.name)}">
    <label class="lbl">Avatar color</label><div class="chips">${AV_HUES.map(h => `<button data-hue="${h}" aria-label="Color ${h}" class="${d.hue === h ? "on" : ""}" style="min-width:46px;background:hsl(${h} 100% 65%);color:#14122a;${d.hue === h ? "outline:2px solid #fff" : ""}">●</button>`).join("")}</div>
    <button class="cta" data-go="save" style="margin-top:22px">Save changes</button>`;
}
function saveProfile() {
    const n = ($("pName").value.trim() || S.user).slice(0, 20);
    S.prof = {name:n, hue:draft.hue, photo:draft.photo};
    store.set(uk("mtProf"), S.prof);
    refreshPlan();
    meView = "menu";
    renderMe();
    toast("Profile updated");
}
const fillRange = el => range(el, (el.value - el.min) / (el.max - el.min) * 100);
function renderMe() {
    const b = $("meBody"), back = `<button class="link" data-go="menu" style="margin:0 0 10px">← Back</button>`;
    let h = "";
    if (meView === "profile") {
        h = profileHTML(back);
    }
    else if (meView === "settings") {
        h = `${back}<h2>Settings</h2>
        <label class="lbl" for="sPa">Panel opacity <b id="paV">${Math.round(CFG.pa*100)}%</b></label><input type="range" id="sPa" min="10" max="85" value="${Math.round(CFG.pa*100)}">
        <label class="lbl" for="sDim">Background dimming <b id="dimV">${Math.round(CFG.dim*100)}%</b></label><input type="range" id="sDim" min="0" max="60" value="${Math.round(CFG.dim*100)}">
        <label class="sw"><input type="checkbox" id="sAuto" ${CFG.autonext ? "checked" : ""}> Play the next song automatically</label>
        <button class="link" data-go="reset">Reset to default</button>`;
    } else if (meView === "history") {
        h = `${back}<h2>History</h2>` + (S.hist.length
        ? `<div class="hist">${S.hist.map(x => { const s = SONGS[x.i]; return `<button data-hplay="${x.i}"><span class="art" style="background:${grad(s)}">${initial(s)}</span><div><b>${esc(s.title)}</b><small>${esc(s.artist)} · ${new Date(x.t).toLocaleString("en-PH", {month:"short", day:"numeric", hour:"numeric", minute:"2-digit"})}</small></div></button>`; }).join("")}</div><button class="link" data-go="clearh">Clear history</button>`
        : `<p class="empty">Nothing played yet. Play a song and it will show up here.</p>`);
    } else {
        h = `<div class="prof"><div class="avatar" style="${avBg(S.prof)}">${avInit({...S.prof, name:dispName()})}</div><div><h2>${esc(dispName())}</h2><span class="chip">${S.premium ? "★ Premium" : "Free plan"}</span>${S.premium ? ` <small style="color:var(--muted)">until ${dateFmt(S.sub.expires)}</small>` : ""}</div></div>
        <div class="rows"><button data-go="profile"><i>✎</i>Edit profile<em>›</em></button><button data-go="settings"><i>⚙</i>Settings<em>›</em></button><button data-go="history"><i>⏱</i>History<em>${S.hist.length}</em></button>
        <button data-go="premium"><i>★</i>Premium<em>›</em></button><button data-go="out" class="danger"><i>⎋</i>Sign out</button></div>`;
    }
    b.innerHTML = h;
    b.querySelectorAll("input[type=range]").forEach(fillRange);
}
function openMe() {
    meView = "menu";
    renderMe();
    $("meModal").hidden = false;
    $("meX").focus();
}
function closeMe() {
    $("meModal").hidden = true;
}
function closeAll() {
    closeModal();
    closeMe();
}
document.querySelectorAll("[data-me]").forEach(b => b.onclick = openMe);
$("meX").onclick = closeMe; $("meModal").addEventListener("click", e => {
    if (e.target.id === "meModal") closeMe();
});
document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeAll();
});
$("meBody").addEventListener("click", e => {
    const hp = e.target.closest("[data-hplay]"), g = e.target.closest("[data-go]"), hu = e.target.closest("[data-hue]");
    if (hu) {
        draft.name = $("pName").value;
        draft.hue = +hu.dataset.hue;
        draft.photo = draft.photo;
        return renderMe();
    }
    if (hp) {
        closeMe();
        return load(+hp.dataset.hplay, true);
    }
    if (!g) return;
    const v = g.dataset.go;
    if (v === "out") return signOut();
    if (v === "save") return saveProfile();
    if (v === "rmphoto") {
        draft.name = $("pName").value;
        draft.photo = "";
        renderMe();
        return;
    }
    if (v === "profile") draft = {name:dispName(), hue:S.prof.hue ?? 260, photo:S.prof.photo || ""};
    if (v === "premium") {
        closeMe();
        return openModal();
    }
    if (v === "reset") {
        Object.assign(CFG, DEF);
        saveCfg();
        applyCfg();
        meView = "settings";
    }
    else if (v === "clearh") {
        S.hist = [];
        store.set(uk("mtHist"), S.hist);
        meView = "history";
    }
    else meView = v;
    renderMe();
});
$("meBody").addEventListener("change", e => {
    if (e.target.id !== "pFile") return;
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast("Please choose an image file.");
    const name = $("pName").value, rd = new FileReader();
    rd.onload = () => {
        const im = new Image();
        im.onload = () => {
            const c = document.createElement("canvas");
            c.width = c.height = 160;
            const m = Math.min(im.width, im.height);
            c.getContext("2d").drawImage(im, (im.width - m)/2, (im.height - m)/2, m, m, 0, 0, 160, 160);
            draft.photo = c.toDataURL("image/jpeg", .85);
            draft.name = name;
            renderMe();
        };
        im.onerror = () => toast("Could not read that image.");
        im.src = rd.result;
    };
    rd.readAsDataURL(f);
});
$("meBody").addEventListener("input", e => {
    const t = e.target;
    if (t.id === "sPa") {
        CFG.pa = t.value/100;
        $("paV").textContent = t.value + "%";
    }
    else if (t.id === "sDim") {
        CFG.dim = t.value/100;
        $("dimV").textContent = t.value + "%";
    }
    else if (t.id === "sAuto") CFG.autonext = t.checked;
    else return;
    if (t.type === "range") fillRange(t);
    saveCfg();
    applyCfg();
});
/* ---------- 10. START-UP ----------
   Runs once: greeting by time of day, restore volume, load song 0, then
   resume the saved user or show the sign-in sheet.                          */
const hr = new Date().getHours();
$("greet").textContent = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
applyVol(); load(0, false);
const savedUser = store.get("mtUser", "");
if (savedUser) startSession(savedUser); else {
    refreshPlan();
    $("auth").hidden = false;
}
