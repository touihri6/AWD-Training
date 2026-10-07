package esprit.gateway;

import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.loadbalancer.core.RandomLoadBalancer;
import org.springframework.cloud.loadbalancer.core.ReactorLoadBalancer;
import org.springframework.cloud.loadbalancer.core.ServiceInstanceListSupplier;
import org.springframework.cloud.loadbalancer.support.LoadBalancerClientFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;

public class CandidatLoadBalancerConfig {

    @Bean
    public ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(Environment environment,
                                                                   LoadBalancerClientFactory loadBalancerClientFactory) {
        String serviceId = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new RandomLoadBalancer(
                loadBalancerClientFactory.getLazyProvider(serviceId, ServiceInstanceListSupplier.class),
                serviceId);
    }

    // Round Robin strategy
    // @Bean
    // public ReactorLoadBalancer<ServiceInstance> roundRobinLoadBalancer(Environment environment,
    //                                                                    LoadBalancerClientFactory loadBalancerClientFactory) {
    //     String serviceId = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
    //     return new RoundRobinLoadBalancer(
    //             loadBalancerClientFactory.getLazyProvider(serviceId, ServiceInstanceListSupplier.class),
    //             serviceId);
    // }
}
