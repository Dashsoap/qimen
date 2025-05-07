<template>
    <div>
        <div>
            <DatePicker :locale="locale" v-model:value="dateValue"></DatePicker>
            <TimePicker :locale="locale" v-model:value="timeValue"></TimePicker>
            <Button @click="paipan()">排盘</Button>
        </div>
        <div v-if="panData">
            <div>干支：{{ panData.干支 }}</div>
            <div>節氣：{{ panData.節氣 }}</div>
            <div>排局：{{ panData.排局 }}</div>
            <div v-for="(item, key) in panData.旬空" :key="`xunkong-${key}`">{{ key }}：{{ item }}</div>
            <div v-for="(item, key) in panData.值符值使" :key="`zhifu-${key}`">{{ key }}：{{ item }}</div>
        </div>


        <table class="table">
            <tr class="row">
                <td class="col">
                    <QimenItem index="四" />
                </td>
                <td class="col">
                    <QimenItem index="九" />
                </td>
                <td class="col">
                    <QimenItem index="二" />
                </td>
            </tr>
            <tr class="row">
                <td class="col">
                    <QimenItem index="三" />
                </td>
                <td class="col">
                    <QimenItem index="五" />
                </td>
                <td class="col">
                    <QimenItem index="七" />
                </td>
            </tr>
            <tr class="row">
                <td class="col">
                    <QimenItem index="八" />
                </td>
                <td class="col">
                    <QimenItem index="一" />
                </td>
                <td class="col">
                    <QimenItem index="六" />
                </td>
            </tr>
        </table>
    </div>
</template>

<script setup lang="ts">
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import { ref } from "vue";
import dayjs from 'dayjs';
import Qimen from '../qimendunjia/index.js'
import QimenItem from '../components/QimenItem.vue'
import { useQimenStore } from "../stores/index";
import { DatePicker, TimePicker, Button } from 'ant-design-vue';
import 'dayjs/locale/zh-cn';
import type { Dayjs } from 'dayjs';
import { storeToRefs } from 'pinia';

dayjs.locale('zh-cn');

// 定义 panData 的类型接口
interface PanDataType {
    干支?: string;
    節氣?: string;
    排局?: string;
    旬空?: Record<string, string>;
    值符值使?: Record<string, string>;
    [key: string]: any;
}

const dateValue = ref<Dayjs>();
const timeValue = ref<Dayjs>();
const store = useQimenStore();

const { panData } = storeToRefs(store)

function paipan() {
    if(dateValue.value){
        const date = dateValue.value;
        const time = timeValue.value;
        store.setPanData(new Qimen(date.year(), date.month()+1, date.date(), time?.hour() || 0).p);
    }else{
        store.setPanData(new Qimen(2023, 12, 24, 6).p);
    }
    console.log(store.panData)
}

</script>
  
<style>
.table {
    border-collapse: collapse;
    margin-top: 50px;
    margin-left: auto;
    margin-right: auto;
    background-color: #fff;
}

.col {
    width: 100px;
    height: 100px;
    border: 2px solid #e4e7ed;
}
</style>
  