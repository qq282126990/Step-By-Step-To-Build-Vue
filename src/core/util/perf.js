import { inBrowser } from './env'

export let mark;
export let measure

// 判断环境，如果不是生产环境则继续，否则什么都不做
// 如果是生产环境，那么这个文件导出的两个变量，都是 undefined。
if (process.env.NODE_ENV !== 'production') {
      // 定义一个变量 perf
      // 如果在浏览器环境，那么 perf 的值就是 window.performance
      // 否知为false
      const perf = inBrowser && window.performance;

      // 做了一系列判断，目的是确定 performance 的接口可用，
      // 如果都可用，那么将初始化 mark 和 measure 变量。
      /* istanbul ignore if */
      if (
            perf &&
            perf.mark &&
            perf.measure &&
            perf.clearMarks &&
            perf.clearMeasures
      ) {
            // 实际上，mark 是一个函数，这个函数的作用就是使用给定的 tag，
            // 通过 performance.mark() 方法打一个标记。
            // 添加一个timestamp 在浏览器具有指定名称的性能加载缓冲区中添加一个记录.
            // 程序定义的时间戳可以通过一个被检索 Performance 接口的 getEntries*() 方法 
            // (getEntries(), getEntriesByName() 或者 getEntriesByType()).
            mark = tag => perf.mark(tag);

            // measure 方法接收三个参数，
            // 这三个参数与 performance.measure() 方法所要求的参数相同，
            // 它的作用就是调用一下 performance.measure() 方法，
            // 然后调用三个清除标记的方法：
            measure = (name, startTag, endTag) => {
                  // 方法在浏览器性能记录缓存中创建了一个名为时间戳的记录来记录两个特殊标志位（通常称为开始标志和结束标志）。 
                  // 被命名的时间戳称为一次测量（measure）。
                  // 测量名字 、测量的开始标志名字 、 测量结束标志名字
                  perf.measure(name, startTag, endTag)
                  perf.clearMarks(startTag)
                  perf.clearMarks(endTag)
                  perf.clearMeasures(name)
            }
      }
}

// mark 和 measure 的作用，首先 mark 可以理解为“打标记”，
// 比如如下代码我们在 for 循环的前后各打一个标记：

// mark('for-start')
// for (let i = 0; i < 100; i++) {
//     console.log(i)
// }
// mark('for-end')

// 但是仅仅打标记是没有什么用的，这个时候就需要 measure 方法，
// 它能够根据两个标记来计算这两个标记间代码的性能数据，你只需要这样即可：
// measure('for-measure', 'for-start', 'for-end')