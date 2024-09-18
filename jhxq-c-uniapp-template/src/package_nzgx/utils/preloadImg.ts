const imgBaseUrl = 'https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/';
const clueBaseUrl = 'https://applet.cdn.wanjuyuanxian.com/nzgx/static/clues/';

// 需要预加载的 img 文件夹下的图片
const imagesToPreloadFromImg = [
  'audio_search_location_bg.png',
  'avatar_frame.png',
  'avatar1.png',
  'backspace_icon.png',
  'bing.png',
  'blur1.png',
  'circle1.png',
  'circle2.png',
  'clear_icon.png',
  'close_icon.png',
  'clue1.png',
  'clue2.png',
  'clue3.png',
  'completed_icon.png',
  'cue_seleted.png',
  'cue_seleted2.png',
  'cue_set_bg.png',
  'cue_set_paper.png',
  'di.png',
  'dialog_input_bg.png',
  'dm_edit_icon.png',
  'edit_icon.png',
  'exp.png',
  'exp_border.png',
  'FAQ.png',
  'fu.png',
  'fu_input_bg.png',
  'gl_correct_icon.png',
  'gl_mission_fail_icon.png',
  'gl_mission_success_icon.png',
  'gl_select_icon.png',
  'gl_wrong_icon.png',
  'gualing_bg.png',
  'gualing_bg2.png',
  'gualing_bg3.png',
  'haibao.png',
  'input_bg.png',
  'jia.png',
  'left.png',
  'location_bg.png',
  'location_icon.png',
  'make_old.png',
  'make_old2.png',
  'make_old3.png',
  'map.png',
  'map2.png',
  'new_clue_btn.png',
  'number_bg.png',
  'out_btn_icon.png',
  'paper.png',
  'paper2.png',
  'paper3.png',
  'paper5.png',
  'pause.png',
  'pause_icon.png',
  'pg.png',
  'play.png',
  'play_icon.png',
  'player_dialog_bg.png',
  'player_dialog_btn.png',
  'player_dialog_btn1.png',
  'player_dialog_btn2.png',
  'ren.png',
  'room_bg.png',
  'set_not_selected.png',
  'set_selected.png',
  'teaminfo_bg.png',
  'teaminfo_title_bg.png',
  'tian.png',
  'turtle_shell.png',
  'underway_icon.png',
  'voice_icon.png',
  'wood.png',
  'wu.png',
  'wu2.png',
  'yi.png',
  'zhufeng.png',
  'paper6.jpg'
];
// 封装预加载方法，并导出该方法
export function preloadImages() {
    const excludeImages = [19, 20, 38, 39, 40, 41]; // 排除的 clue 编号
    const imagesToPreloadFromClues = [];
  
    // 动态生成 clues 文件夹下的图片路径
    for (let i = 1; i <= 50; i++) {
      if (!excludeImages.includes(i)) {
        imagesToPreloadFromClues.push(`clue${i}.png`);
      }
    }
  
    // 整合 img 和 clues 文件夹中的图片进行预加载
    const imagesToPreload = [
      ...imagesToPreloadFromImg.map(fileName => ({
        type: 'image',
        src: `${imgBaseUrl}${fileName}`
      })),
      ...imagesToPreloadFromClues.map(fileName => ({
        type: 'image',
        src: `${clueBaseUrl}${fileName}`
      }))
    ];
  
    // 调用 wx.preloadAssets 进行预加载
    wx.preloadAssets({
      data: imagesToPreload,
      success(resp) {
        console.log('Preloaded all images successfully:', resp);
      },
      fail(err) {
        console.log('Failed to preload some images:', err);
      },
    });
  }
