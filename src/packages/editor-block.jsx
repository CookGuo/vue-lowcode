import { computed, defineComponent, inject, onMounted, ref } from "vue";

export default defineComponent({
    props: {
        block: { type: Object },
        formData: { type: Object }
    },
    setup(props) {
        const blockStyles = computed(() => ({
            top: `${props.block.top}px`,
            left: `${props.block.left}px`,
            zIndex: `${props.block.zIndex}`
        }));
        const config = inject('config');

        const blockRef = ref(null)
        onMounted(() => {
            let { offsetWidth, offsetHeight } = blockRef.value;
            if (props.block.alignCenter) { // 说明是拖拽松手的时候才渲染的，其他的默认渲染到页面上的内容不需要居中
                props.block.left = props.block.left - offsetWidth / 2;
                props.block.top = props.block.top - offsetHeight / 2; // 原则上重新派发事件
                props.block.alignCenter = false; // 让渲染后的结果才能去居中
            }
            props.block.width = offsetWidth;
            props.block.height = offsetHeight;
        })

        return () => {
            // 通过block的key属性直接获取对应的组件 
            const component = config.componentMap[props.block.key];
            // 获取render函数


            const RenderComponent = component.render({
                props: props.block.props,
                // model: props.block.model  => {default:'username'}  => {modelValue: FormData.username,"onUpdate:modelValue":v=> FormData.username = v}

                model: Object.keys(component.model || {}).reduce((prev, modelName) => {
                    let propName = props.block.model[modelName]; // 'username'
                    prev[modelName] = {
                        modelValue: props.formData[propName], // zfjg
                        "onUpdate:modelValue": v=>  props.formData[propName] = v
                    }
                    return prev;
                }, {})
            });
            return <div class="editor-block" style={blockStyles.value} ref={blockRef}>
                {RenderComponent}
            </div>
        }
    }
})