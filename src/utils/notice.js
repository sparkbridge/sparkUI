import { reactive } from 'vue';

export const noticeState = reactive({
    show: false,
    message: '',
    type: 'info', // info, success, error
});

let timer = null;

export const showNotice = (msg, type = 'info', duration = 3000) => {
    noticeState.message = msg;
    noticeState.type = type;
    noticeState.show = true;

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
        noticeState.show = false;
    }, duration);
};