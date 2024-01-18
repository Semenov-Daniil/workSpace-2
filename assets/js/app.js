const mySelect = {
    props: {
        modelValue: {
            type: String
        },
        options: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        changeOption(event) {
            this.$emit('update:modelValue', event.target.value);
        }
    },
    template: `
        <select
            name="city"
            id="city_list"
            class="filter__form_item__input"
            style="width: 100%"
            :value="modelValue"
            @change="changeOption"
        >
            <option value="">Выбрать город</option>
            <option
                v-for="(option, index) in options"
                :key="index"
                :value="option"
                >
                {{ option }}
            </option>
        </select>`
}

const myCheckbox = {
    props: {
        title: {
            type: String,
            default: "",
        },
        value: {
            type: Boolean,
            default: false
        },
        id: {
            type: String, Number,
            default: "",
        }
    },
    template: `
        <div class="filter__form__item__input__section">
            <input
                type="checkbox"
                class="filter__form_item__checkbox"
                :id="id"
                :checked="value"
                @change="$emit('update:value', $event.target.checked)"
            />
            <label :for="id">{{ title }}</label>
        </div>`
};

const myCheckboxList = {
    components: {
        myCheckbox
    },
    props: {
        modelValue: {
            type: Array,
            required: true,
            default: () => []
        },
        title: {
            type: String, Number,
            default: ''
        }
    },
    template: `
        <div class="filter__form__item">
            <label for="" class="filter__form__item__label">{{ title }}</label>
            <my-checkbox
                v-for="(checkbox, index) in modelValue"
                :key="index"
                v-model:value="checkbox.value"
                :title="checkbox.title"
                :id="checkbox.id"
                @change="$emit('update:modelValue', JSON.parse(JSON.stringify(modelValue)))"
            />
        </div>`
}

const workItem = {
    props: {
        workcard: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            img: 'https://workspace-methed.vercel.app/' + this.workcard.logo,
        }
    },
    template: `
        <div
            class="work-list__item"
            style="cursor: pointer;"
            @click="$emit('popup', workcard.id)"
        >
            <img
                :src="img"
                :alt="workcard.company"
                class="work-list__item__img"
            />
            <p class="work-list__item__company">{{ workcard.company }}</p>
            <p class="work-list__item__title">{{ workcard.title }}</p>
            <ul class="work-list__item__info">
                <li>от {{ (Number(workcard.salary)).toLocaleString("ru-RU") }}₽</li>
                <li>{{ workcard.type }}</li>
                <li>{{ workcard.format }}</li>
                <li>{{ workcard.experience }}</li>
            </ul>
        </div>`
}

const workList = {
    template: `
    <section class="work-list">
        <workItem
            v-for="(work, index) in worklist"
            :key="index"
            :workcard="work"
            @popup="$emit('popup', $event)"
        ></workItem>
    </section>`,
    components: {
        workItem
    },
    props: {
        worklist: {
            type: Array,
            required: true,
        }
    },
}

const App = {
    components: {
        mySelect,
        myCheckboxList,
        workList
    },
    data() {
        return {
            selectCity: [],
            selectSort: "",

            minWage: 10,
            maxWage: 1000000000,
            minWageValue: '',
            minWageTitle: '',
            maxWageValue: '',
            maxWageTitle: '',

            formWork: {
                title: "Формат",
                checkboxList: [
                    { title: 'Офис', value: false, id: 'format_office' },
                    { title: 'Удаленный', value: false, id: 'format_remote' },
                    { title: 'Гибкий', value: false, id: 'format_flexible' },
                ],
            },
            experience: {
                title: "Опыт работы",
                checkboxList: [
                    { title: 'Не важно', value: false, id: 'experience_not-important' },
                    { title: 'Без опыта', value: false, id: 'experience_whithout' },
                    { title: 'От 1 года до 3-х лет', value: false, id: 'experience_from-one-to-three' },
                    { title: 'От 3-х лет', value: false, id: 'experience_to-three' },
                ],
            },
            employment: {
                title: "Занятость",
                checkboxList: [
                    { title: 'Полная', value: false, id: 'employment_full' },
                    { title: 'Частичная', value: false, id: 'employment_partially' },
                    { title: 'Стажировка', value: false, id: 'employment_internship' },
                    { title: 'Проектная работа', value: false, id: 'employment_project' },
                ],
            },

            workList: [],

            filterShow: false,
            companyShow: false,

            company: {},

            width: 1600,

            baseUrl: 'https://workspace-methed.vercel.app/api'
        }
    },
    methods: {
        async getResponseFilter() {
            let searchParams = new URLSearchParams({
                'city': this.selectSort,
                'pay-from': this.minWageValue,
                'pay-to': this.maxWageValue
            });

            for (let format of this.formWork.checkboxList) {
                if (format.value) {
                    searchParams.append('format', format.title);
                }
            }

            for (let experience of this.experience.checkboxList) {
                if (experience.value) {
                    searchParams.append('experience', experience.title);
                }
            }

            for (let employment of this.employment.checkboxList) {
                if (employment.value) {
                    searchParams.append('type', employment.title);
                }
            }

            try {
                let response = await fetch('https://workspace-methed.vercel.app/api/vacancy?' + searchParams);
                this.workList = (await response.json()).vacancies;
            } catch (err) {
                console.log(err);
            }
        },

        isNumber(event) {
            let charCode = event.charCode;
            if (charCode < 48 || charCode > 57) {
                event.preventDefault();
            }
        },

        reset() {
            Object.assign(this.$data, this.$options.data.call(this));
            this.featchCity();
            this.featchVacancy();
        },

        validateMinWageValue() {
            if (this.minWageValue > this.maxWage) {
                this.minWageValue = this.maxWage;
            }

            if (this.minWageValue < 0) {
                this.minWageValue = 0;
            }

            if (this.minWageValue !== '') {
                this.minWageValue = Number(this.minWageValue);
            }

            if (this.minWageValue === 0) {
                this.minWageValue = Number(this.minWageValue);
            }

            if (this.minWageValue !== '') {
                this.minWageTitle = 'от ' + this.minWageValue.toLocaleString('ru-RU') + ' ₽';
            }
        },

        validateMaxWageValue() {
            if (this.maxWageValue > this.maxWage) this.maxWageValue = this.maxWage;

            if (this.maxWageValue < this.minWage && this.maxWageValue !== '') this.maxWageValue = this.minWage;

            if (this.maxWageValue < this.minWageValue) this.maxWageValue = this.minWageValue;

            if (this.maxWageValue !== '') this.maxWageValue = Number(this.maxWageValue);

            if (this.maxWageValue) this.maxWageTitle = 'до ' + this.maxWageValue.toLocaleString('ru-RU') + ' ₽';
        },

        async featchCity() {
            try {
                let response = await axios('/locations');
                this.selectCity = await response.data;
            } catch (error) {
                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    console.log(error.request);
                } else {
                    console.log('Error', error.message);
                }
                console.log(error.config);
            }
        },

        async featchVacancy() {
            try {
                let response = await axios('/vacancy');
                this.workList = (await response.data).vacancies;
            } catch (error) {
                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    console.log(error.request);
                } else {
                    console.log('Error', error.message);
                }
                console.log(error.config);
            }
        },

        async openPopup(event) {
            try {
                let response = await fetch('https://workspace-methed.vercel.app/api/vacancy/' + event);
                this.company = (await response.json());
                this.companyShow = true;
            } catch (err) {
                alert(err);
            }
        },

        closePopup() {
            this.companyShow = false;
            this.company = {};
        },

        openCloseFilter() {
            if (this.width < 1024) {
                this.filterShow = !this.filterShow;

            }
        },

        showFilter() {
            if (this.width < 1024) {
                return this.filterShow;
            } else {
                return true;
            }
        }
    },
    created() {
        window.addEventListener("resize", () => { this.width = document.documentElement.clientWidth; });
    },
    destroyed() {
        window.removeEventListener("resize", () => { this.width = document.documentElement.clientWidth; });
    },
    mounted() {
        axios.defaults.baseURL = this.baseUrl;
        this.featchCity();
        this.featchVacancy();
    }
}

Vue
    .createApp(App)
    .mount('#app');